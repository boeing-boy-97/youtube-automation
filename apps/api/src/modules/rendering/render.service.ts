import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { prisma } from '../../database/prisma.js';
import { getRenderer } from '../../providers/rendering/index.js';
import { getStorage } from '../../providers/storage/index.js';
import { transitionState } from '../content/content.state.js';
import { newId } from '../../common/utils/ids.js';
import { enqueueEvent } from '../../events/outbox/outbox.js';
import { getQueue } from '../../jobs/queues/index.js';
import { NotFoundError, ProviderError } from '../../common/errors/app-error.js';
import type { SceneInput } from '../../providers/rendering/rendering.provider.js';

export async function renderProject(workspaceId: string, contentId: string, projectId: string, userId?: string, onProgress?: (pct: number, stage: string) => void) {
  let project = await prisma.videoProject.findFirst({
    where: { id: projectId, workspaceId },
    include: {
      content: { include: { scenes: { include: { assets: { include: { asset: true } } } } } },
    },
  });

  if (!project) {
    project = await prisma.videoProject.findFirst({
      where: { contentId, workspaceId },
      include: {
        content: { include: { scenes: { include: { assets: { include: { asset: true } } } } } },
      },
    });
  }

  if (!project) {
    const content = await prisma.content.findFirst({
      where: { id: contentId, workspaceId },
    });
    if (!content) throw new NotFoundError('Content', contentId);

    project = await prisma.videoProject.create({
      data: {
        workspaceId,
        contentId,
        width: 1080,
        height: 1920,
        fps: 30,
        aspectRatio: '9:16',
      },
      include: {
        content: { include: { scenes: { include: { assets: { include: { asset: true } } } } } },
      },
    });
  }

  await transitionState(prisma, { contentId, workspaceId, to: 'RENDERING', performedById: userId });

  const renderJob = await prisma.renderJob.create({
    data: {
      id: newId('rjb'),
      workspaceId,
      projectId: project.id,
      status: 'ACTIVE',
      attempt: 1,
      progress: 0,
      startedAt: new Date(),
    },
  });

  const storage = getStorage();
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `sf-render-${project.id}-`));

  try {
    // Build scene inputs
    const scenes: SceneInput[] = [];
    for (const sc of project.content.scenes) {
      const visualAsset = sc.assets.find((a) => a.role === 'visual');
      let visualLocal: string | undefined;
      if (visualAsset) {
        const buf = await storage.getBuffer(visualAsset.asset.storageKey);
        visualLocal = path.join(workDir, `scene_${String(sc.index).padStart(3, '0')}${extFromKey(visualAsset.asset.storageKey)}`);
        await fs.writeFile(visualLocal, buf.body);
      }
      scenes.push({
        id: sc.id,
        durationSec: Number(sc.durationSec),
        visualKey: visualAsset?.asset.storageKey,
        textOverlay: sc.textOverlay || undefined,
        transition: (sc.transition || 'cut') as 'cut' | 'fade' | 'none',
      });
    }

    // Audio track (voiceover)
    const voiceAsset = await prisma.asset.findFirst({
      where: { workspaceId, contentId, kind: 'VOICEOVER', status: 'READY' },
    });

    const renderer = getRenderer();
    const outputKey = storage.objectKey(workspaceId, 'renders', project.id, 'mp4');

    const result = await renderer.render(
      {
        projectId: project.id,
        workspaceId,
        scenes,
        audioTrack: voiceAsset ? { key: voiceAsset.storageKey } : undefined,
        width: project.width,
        height: project.height,
        fps: project.fps || 30,
        outputKey,
      },
      async (p) => {
        const pct = Math.round(p.percent);
        await prisma.renderJob.update({ where: { id: renderJob.id }, data: { progress: pct, stage: p.stage } }).catch(() => undefined);
        onProgress?.(pct, p.stage);
      },
    );

    // Probe already happened inside renderer — create output Asset
    const finalAsset = await prisma.asset.create({
      data: {
        id: newId('ast'),
        workspaceId,
        contentId,
        kind: 'RENDER_OUTPUT',
        type: 'VIDEO',
        status: 'READY',
        storageKey: outputKey,
        filename: `render_${project.id}.mp4`,
        mimeType: 'video/mp4',
        sizeBytes: result.sizeBytes,
        width: result.width,
        height: result.height,
        durationSec: result.durationSec,
        fps: result.fps,
        provider: 'ffmpeg',
        checksum: undefined,
        createdById: userId,
      },
    });

    await prisma.renderJob.update({
      where: { id: renderJob.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        stage: 'done',
        outputKey,
        outputAssetId: finalAsset.id,
        finishedAt: new Date(),
        diagnostics: result.diagnostics as any,
      },
    });
    await prisma.videoProject.update({
      where: { id: project.id },
      data: { status: 'COMPLETED', finalAssetId: finalAsset.id },
    });
    await prisma.content.update({
      where: { id: contentId },
      data: { durationSec: Math.round(result.durationSec) },
    });

    await prisma.$transaction(async (tx) => {
      await transitionState(tx, { contentId, workspaceId, to: 'RENDERED', performedById: userId, metadata: { assetId: finalAsset.id, sizeBytes: result.sizeBytes } });
      await enqueueEvent(tx, 'RenderCompleted', 'content', contentId, { assetId: finalAsset.id, sizeBytes: result.sizeBytes, durationSec: result.durationSec }, {});
    });

    // Enqueue QC
    const qQC = getQueue('quality-check');
    await qQC.add('quality-check', { workspaceId, contentId, projectId, assetId: finalAsset.id, userId });

    return { ok: true, assetId: finalAsset.id, sizeBytes: result.sizeBytes, durationSec: result.durationSec, state: 'RENDERED' as const };
  } catch (err) {
    await prisma.renderJob.update({
      where: { id: renderJob.id },
      data: {
        status: 'FAILED',
        errorCode: (err as any)?.code || 'RENDER_FAILED',
        errorMessage: (err as Error).message,
        finishedAt: new Date(),
      },
    });
    await prisma.videoProject.update({ where: { id: project.id }, data: { status: 'FAILED' } });
    await transitionState(prisma, {
      contentId, workspaceId, to: 'RENDER_FAILED', performedById: userId,
      error: { code: 'RENDER_FAILED', message: (err as Error).message },
    });
    throw new ProviderError(`Render failed: ${(err as Error).message}`, { cause: err });
  } finally {
    fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

function extFromKey(key: string): string {
  const m = key.match(/\.([a-z0-9]{2,6})$/i);
  return m ? '.' + m[1].toLowerCase() : '.bin';
}
