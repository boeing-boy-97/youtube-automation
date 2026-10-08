import ffmpeg from 'fluent-ffmpeg';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { env } from '../../config/env.js';
import { ProviderError } from '../../common/errors/AppError.js';
import type { MediaInfo, RenderInput, RenderProgress, RenderResult, RenderingProvider } from './RenderingProvider.js';
import { getStorage } from '../storage/index.js';
import { logger } from '../../common/logger/logger.js';

if (env.FFMPEG_PATH) ffmpeg.setFfmpegPath(env.FFMPEG_PATH);
// ffprobe default from PATH; if env specifies, use it
if (process.env.FFPROBE_PATH) ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);

function runFfprobe(filePath: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

export class FFmpegRenderingProvider implements RenderingProvider {
  readonly name = 'ffmpeg';

  async probe(filePath: string): Promise<MediaInfo> {
    try {
      const data = await runFfprobe(filePath);
      const v = data.streams.find((s) => s.codec_type === 'video');
      const a = data.streams.find((s) => s.codec_type === 'audio');
      if (!v) throw new ProviderError(`No video stream found in ${filePath}`);
      const fps = parseFps(v.r_frame_rate || v.avg_frame_rate || '0/0');
      const stat = await fs.stat(filePath);
      return {
        durationSec: Number(data.format.duration || 0),
        width: v.width || 0,
        height: v.height || 0,
        codec: v.codec_name || 'unknown',
        fps,
        sizeBytes: stat.size,
        format: data.format.format_name || 'unknown',
        audioCodec: a?.codec_name,
        audioSampleRate: a?.sample_rate ? Number(a.sample_rate) : undefined,
      };
    } catch (err) {
      throw new ProviderError(`ffprobe failed for ${path.basename(filePath)}`, { cause: err });
    }
  }

  async render(input: RenderInput, onProgress?: (p: RenderProgress) => void | Promise<void>): Promise<RenderResult> {
    const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `sf-render-${input.projectId}-`));
    const stages: Array<{ name: string; durationMs: number }> = [];
    const startedAt = Date.now();
    const storage = getStorage();

    try {
      // 1. Stage assets locally (download all scene visuals + audio)
      const stageStart = Date.now();
      const localFiles: Record<string, string> = {};
      await Promise.all(input.scenes.map(async (s, i) => {
        if (!s.visualKey) return;
        const ext = extFromKey(s.visualKey);
        const local = path.join(workDir, `scene_${String(i).padStart(3, '0')}${ext}`);
        const buf = (await storage.getBuffer(s.visualKey)).body;
        await fs.writeFile(local, buf);
        localFiles[s.id] = local;
      }));
      let localAudio: string | undefined;
      if (input.audioTrack?.key) {
        localAudio = path.join(workDir, 'audio.mp3');
        const buf = (await storage.getBuffer(input.audioTrack.key)).body;
        await fs.writeFile(localAudio, buf);
      }
      stages.push({ name: 'stage-assets', durationMs: Date.now() - stageStart });

      // 2. Build a concat-style render using a filter_complex that concatenates per-scene inputs with transitions.
      // Safer approach: render each scene to a standardized clip (same resolution/fps/duration) then concat.
      const clipStart = Date.now();
      const clips: string[] = [];
      for (let i = 0; i < input.scenes.length; i++) {
        const s = input.scenes[i];
        const src = localFiles[s.id];
        const clipOut = path.join(workDir, `clip_${String(i).padStart(3, '0')}.mp4`);
        clips.push(clipOut);
        if (src) {
          await normalizeClip({ input: src, output: clipOut, width: input.width, height: input.height, fps: input.fps || 30, durationSec: s.durationSec, text: s.textOverlay });
        } else {
          await createSolidClip({ output: clipOut, width: input.width, height: input.height, fps: input.fps || 30, durationSec: s.durationSec, text: s.textOverlay });
        }
        await onProgress?.({ stage: 'normalizing-clips', percent: ((i + 1) / input.scenes.length) * 40 });
      }
      stages.push({ name: 'normalize-clips', durationMs: Date.now() - clipStart });

      // 3. Write concat list and concatenate
      const concatStart = Date.now();
      const listPath = path.join(workDir, 'list.txt');
      await fs.writeFile(listPath, clips.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join('\n'), 'utf8');
      const concatOut = path.join(workDir, 'concat.mp4');
      await runFfmpegArgs(['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-an', concatOut]);
      stages.push({ name: 'concat-clips', durationMs: Date.now() - concatStart });

      // 4. Mux audio if present
      const muxStart = Date.now();
      let finalLocal: string;
      if (localAudio) {
        finalLocal = path.join(workDir, 'final.mp4');
        await runFfmpegArgs(['-y', '-i', concatOut, '-i', localAudio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', finalLocal]);
      } else {
        finalLocal = concatOut;
      }
      stages.push({ name: 'mux-audio', durationMs: Date.now() - muxStart });

      // 5. Validate via ffprobe
      const probeStart = Date.now();
      const info = await this.probe(finalLocal);
      if (info.width !== input.width || info.height !== input.height) {
        // Not a hard failure — log and continue; rendering produced different dims
        logger.warn({ msg: 'render:dimensions-mismatch', expected: `${input.width}x${input.height}`, got: `${info.width}x${info.height}` });
      }
      stages.push({ name: 'probe', durationMs: Date.now() - probeStart });

      // 6. Upload to storage
      const uploadStart = Date.now();
      const fileBuf = await fs.readFile(finalLocal);
      await storage.put(input.outputKey, fileBuf, 'video/mp4');
      stages.push({ name: 'upload', durationMs: Date.now() - uploadStart });

      await onProgress?.({ stage: 'done', percent: 100 });

      return {
        outputKey: input.outputKey,
        sizeBytes: info.sizeBytes,
        durationSec: info.durationSec,
        width: info.width,
        height: info.height,
        codec: info.codec,
        fps: info.fps,
        diagnostics: { stages, ffprobe: info },
      };
    } catch (err) {
      throw new ProviderError('Render failed', { cause: err, details: { workDir, stages } });
    } finally {
      // Cleanup work directory (best-effort)
      fs.rm(workDir, { recursive: true, force: true }).catch((e) => logger.warn({ msg: 'render:cleanup-failed', workDir, err: String(e) }));
      logger.info({ msg: 'render:complete', projectId: input.projectId, totalMs: Date.now() - startedAt });
    }
  }
}

function extFromKey(key: string): string {
  const m = key.match(/\.([a-zA-Z0-9]{2,6})$/);
  return m ? '.' + m[1].toLowerCase() : '.bin';
}

function runFfmpegArgs(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const bin = env.FFMPEG_PATH || 'ffmpeg';
    const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', (err) => reject(new ProviderError(`ffmpeg spawn failed: ${err.message}`, { cause: err })));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new ProviderError(`ffmpeg exited with code ${code}`, { details: { stderrTail: stderr.slice(-2000) } }));
    });
  });
}

function parseFps(s: string): number {
  const [a, b] = s.split('/').map(Number);
  if (!a || !b) return 0;
  return a / b;
}

async function normalizeClip({ input, output, width, height, fps, durationSec, text }: { input: string; output: string; width: number; height: number; fps: number; durationSec: number; text?: string }) {
  const vf = [
    `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`,
    `fps=${fps}`,
    `setsar=1`,
  ];
  if (text) {
    const safe = text.replace(/:/g, '\\:').replace(/'/g, "\\'").slice(0, 200);
    vf.push(`drawtext=text='${safe}':fontcolor=white:fontsize=h/20:x=(w-tw)/2:y=h-th-40:box=1:boxcolor=black@0.5:boxborderw=10`);
  }
  const args = ['-y', '-i', input, '-t', String(durationSec), '-vf', vf.join(','), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-an', output];
  await runFfmpegArgs(args);
}

async function createSolidClip({ output, width, height, fps, durationSec, text }: { output: string; width: number; height: number; fps: number; durationSec: number; text?: string }) {
  const vf = [
    `color=c=black:s=${width}x${height}:r=${fps}`,
    `format=yuv420p`,
  ];
  if (text) {
    const safe = text.replace(/:/g, '\\:').replace(/'/g, "\\'").slice(0, 200);
    vf.push(`drawtext=text='${safe}':fontcolor=white:fontsize=h/18:x=(w-tw)/2:y=(h-th)/2`);
  }
  const args = ['-y', '-f', 'lavfi', '-i', vf[0] + ':' + vf[1], '-t', String(durationSec), '-vf', vf.slice(2).join(',') || null, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-an', output].filter(Boolean) as string[];
  await runFfmpegArgs(args);
}
