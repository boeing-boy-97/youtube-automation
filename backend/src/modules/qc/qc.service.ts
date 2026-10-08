import { prisma } from '../../config/database.js';
import { getRenderer } from '../../providers/rendering/index.js';
import { getStorage } from '../../providers/storage/index.js';
import { transitionState } from '../content/content.state.js';
import { newId } from '../../common/utils/id.js';
import { enqueueEvent } from '../../events/outbox.js';
import { getQueue } from '../../config/queues.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export interface QCThresholds {
  minDurationSec: number;
  maxDurationSec: number;
  requiredWidth: number;
  requiredHeight: number;
  requiredFps: number;
  requiredAudio: boolean;
  requiredVideoCodec: string;
  requiredAudioCodec: string;
}

const DEFAULT_THRESHOLDS: QCThresholds = {
  minDurationSec: 5,
  maxDurationSec: 300,
  requiredWidth: 1080,
  requiredHeight: 1920,
  requiredFps: 24,
  requiredAudio: true,
  requiredVideoCodec: 'h264',
  requiredAudioCodec: 'aac',
};

export async function runQualityCheck(workspaceId: string, contentId: string, projectId: string, assetId: string, userId?: string) {
  const project = await prisma.videoProject.findUnique({ where: { id: projectId } });
  if (!project || project.workspaceId !== workspaceId) throw new NotFoundError('VideoProject', projectId);
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || asset.workspaceId !== workspaceId) throw new NotFoundError('Asset', assetId);

  await transitionState(prisma, { contentId, workspaceId, to: 'QUALITY_CHECKING', performedById: userId });

  const check = await prisma.qualityCheck.create({
    data: {
      id: newId('qck'),
      workspaceId,
      contentId,
      projectId,
      status: 'ACTIVE',
      overall: 'PASS',
      startedAt: new Date(),
      thresholds: DEFAULT_THRESHOLDS as any,
      engineVersion: '1',
    },
  });

  const issues: Array<{ category: any; severity: any; message: string; timeSec?: number }> = [];

  // Download file to temp and probe it
  const storage = getStorage();
  const renderer = getRenderer();
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `sf-qc-${project.id}-`));
  const localFile = path.join(workDir, 'render.mp4');
  try {
    const buf = await storage.getBuffer(asset.storageKey);
    await fs.writeFile(localFile, buf.body);
    const info = await renderer.probe(localFile);

    // Technical checks
    if (info.width < DEFAULT_THRESHOLDS.requiredWidth - 1) issues.push({ category: 'RESOLUTION', severity: 'WARNING', message: `Width ${info.width} is below target ${DEFAULT_THRESHOLDS.requiredWidth}` });
    if (info.height < DEFAULT_THRESHOLDS.requiredHeight - 1) issues.push({ category: 'RESOLUTION', severity: 'WARNING', message: `Height ${info.height} is below target ${DEFAULT_THRESHOLDS.requiredHeight}` });
    if (info.fps < DEFAULT_THRESHOLDS.requiredFps) issues.push({ category: 'FRAME_RATE', severity: 'WARNING', message: `FPS ${info.fps} below minimum ${DEFAULT_THRESHOLDS.requiredFps}` });
    if (info.durationSec < DEFAULT_THRESHOLDS.minDurationSec) issues.push({ category: 'DURATION', severity: 'BLOCK', message: `Duration ${info.durationSec.toFixed(1)}s is below minimum ${DEFAULT_THRESHOLDS.minDurationSec}s` });
    if (info.durationSec > DEFAULT_THRESHOLDS.maxDurationSec) issues.push({ category: 'DURATION', severity: 'BLOCK', message: `Duration ${info.durationSec.toFixed(1)}s exceeds maximum ${DEFAULT_THRESHOLDS.maxDurationSec}s` });
    if (DEFAULT_THRESHOLDS.requiredAudio && !info.audioCodec) issues.push({ category: 'AUDIO_LEVEL', severity: 'BLOCK', message: 'No audio stream detected' });
    if (!info.codec.includes('264')) issues.push({ category: 'CODEC', severity: 'WARNING', message: `Video codec is ${info.codec}, expected H.264` });
  } catch (err) {
    issues.push({ category: 'CONTENT_POLICY', severity: 'BLOCK', message: `File could not be probed: ${(err as Error).message}` });
  } finally {
    fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }

  // Content/asset completeness checks
  const voice = await prisma.asset.count({ where: { contentId, kind: 'VOICEOVER', status: 'READY' } });
  if (!voice) issues.push({ category: 'CONTENT_POLICY', severity: 'BLOCK', message: 'Missing voiceover' });
  const visualCount = await prisma.sceneAsset.count({ where: { scene: { contentId }, role: 'visual' } });
  const sceneCount = await prisma.scene.count({ where: { contentId } });
  if (visualCount < sceneCount) issues.push({ category: 'CONTENT_POLICY', severity: 'WARNING', message: `${sceneCount - visualCount} scenes missing visuals` });

  // Persist issues
  for (const i of issues) {
    await prisma.qualityIssue.create({
      data: {
        id: newId('qis'),
        checkId: check.id,
        category: i.category,
        severity: i.severity,
        message: i.message,
        timeSec: i.timeSec,
      },
    });
  }
  const hasBlock = issues.some((i) => i.severity === 'BLOCK');
  const overall = hasBlock ? 'BLOCK' : issues.length > 0 ? 'WARNING' : 'PASS';
  await prisma.qualityCheck.update({
    where: { id: check.id },
    data: { status: 'COMPLETED', overall, finishedAt: new Date() },
  });

  const nextState = hasBlock ? 'QUALITY_FAILED' : 'REVIEW';
  await prisma.$transaction(async (tx) => {
    await transitionState(tx, { contentId, workspaceId, to: nextState as any, performedById: userId, metadata: { checkId: check.id, overall } });
    await enqueueEvent(tx, 'QualityCheckCompleted', 'content', contentId, { checkId: check.id, overall, issueCount: issues.length }, {});
  });

  // If no blocks and not requiring explicit approval (default: true), we still move to REVIEW for user approval.
  // Notifications queue will notify the user.
  const qN = getQueue('notifications');
  await qN.add('notify', { type: 'QC_COMPLETE', workspaceId, contentId, overall });

  return { ok: true, overall, issueCount: issues.length, nextState };
}
