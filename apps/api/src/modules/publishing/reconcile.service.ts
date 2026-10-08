import { prisma } from '../../database/prisma.js';
import { getYouTube, decryptTokens, encryptTokens } from '../../providers/youtube/index.js';
import { transitionState } from '../content/content.state.js';
import { logger } from '../../observability/logger.js';

/**
 * Reconcile publications that are not in terminal state (PENDING_RECONCILE, UPLOADED, PROCESSING)
 * or content stuck in PUBLISHING without a known failure. This is the safety net for the
 * "upload succeeded but DB write failed" case.
 */
export async function reconcilePublications(workspaceId?: string) {
  const stuckPubs = await prisma.publication.findMany({
    where: {
      ...(workspaceId ? { workspaceId } : {}),
      status: { in: ['PENDING_RECONCILE', 'UPLOADED', 'PROCESSING'] },
    },
    include: { channel: { include: { credentials: true } }, content: true },
    take: 100,
  });

  const stuckContent = await prisma.content.findMany({
    where: { state: 'PUBLISHING' },
    include: { publication: true },
    take: 100,
  });

  logger.info({ msg: 'reconcile:scan', publications: stuckPubs.length, stuckContent: stuckContent.length });

  let repaired = 0;
  for (const pub of stuckPubs) {
    if (!pub.channel.credentials) {
      await markFailed(pub.id, pub.contentId, pub.workspaceId, 'Credentials missing');
      repaired++;
      continue;
    }
    try {
      const tokens = decryptTokens(pub.channel.credentials.encryptedToken);
      const yt = getYouTube();
      // If we have a videoId, check its status
      if (pub.videoId) {
        const status = await yt.getVideoStatus(tokens, pub.videoId);
        if (status.uploadStatus === 'processed' || status.uploadStatus === 'uploaded') {
          await prisma.publication.update({
            where: { id: pub.id },
            data: { status: 'LIVE', liveAt: pub.liveAt || new Date(), reconciled: true, processedAt: new Date(), lastCheckAt: new Date() },
          });
          if (pub.content.state !== 'PUBLISHED') {
            await transitionState(prisma, { contentId: pub.contentId, workspaceId: pub.workspaceId, to: 'PUBLISHED', metadata: { reconciled: true, videoId: pub.videoId } });
          }
          repaired++;
          continue;
        }
        if (status.failureReason || status.uploadStatus === 'failed') {
          await markFailed(pub.id, pub.contentId, pub.workspaceId, status.failureReason || 'YouTube reported failure');
          repaired++;
          continue;
        }
      } else {
        // No videoId known, but content has been publishing too long — likely failed.
        // Do NOT re-upload blindly. Mark for user intervention.
        const age = Date.now() - pub.createdAt.getTime();
        if (age > 30 * 60_000) {
          await markFailed(pub.id, pub.contentId, pub.workspaceId, 'Upload timed out without videoId; manual reconciliation required');
          repaired++;
        }
      }
    } catch (err) {
      logger.warn({ msg: 'reconcile:pub-error', publicationId: pub.id, err: (err as Error).message });
    }
  }

  // Content stuck in PUBLISHING with no publication row — need to create a pending-reconcile entry
  for (const c of stuckContent) {
    if (c.publication) continue;
    logger.warn({ msg: 'reconcile:stuck-no-publication', contentId: c.id });
    // We do not have an idempotency key to prove a prior upload did not happen; surface this.
  }

  return { repaired, checked: stuckPubs.length + stuckContent.length };
}

async function markFailed(pubId: string, contentId: string, workspaceId: string, reason: string) {
  await prisma.publication.update({
    where: { id: pubId },
    data: { status: 'FAILED', failedAt: new Date(), failureReason: reason, reconciled: true, lastCheckAt: new Date() },
  });
  try {
    await transitionState(prisma, { contentId, workspaceId, to: 'PUBLISH_FAILED', error: { code: 'PUBLISH_FAILED', message: reason } });
  } catch { /* state may already be terminal */ }
}
