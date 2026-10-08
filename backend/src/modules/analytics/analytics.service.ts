import { prisma } from '../../config/database.js';
import { getYouTube, decryptTokens } from '../../providers/youtube/index.js';
import { newId } from '../../common/utils/id.js';
import { enqueueEvent } from '../../events/outbox.js';
import { NotFoundError, ProviderError } from '../../common/errors/AppError.js';
import { logger } from '../../common/logger/logger.js';

export async function syncAnalyticsForContent(workspaceId: string, contentId: string, _userId?: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { channel: { include: { credentials: true } } },
  });
  if (!content || content.workspaceId !== workspaceId) throw new NotFoundError('Content', contentId);
  if (!content.publishVideoId) return { ok: true, synced: false, reason: 'no-video-id' };
  if (!content.channel?.credentials) throw new ProviderError('Channel credentials missing', { code: 'YOUTUBE_NOT_CONNECTED' });

  const tokens = decryptTokens(content.channel.credentials.encryptedToken);
  const yt = getYouTube();
  const now = new Date();
  const start = content.publishedAt || new Date(now.getTime() - 30 * 24 * 3600_000);

  try {
    const stats = await yt.getVideoAnalytics(tokens, content.publishVideoId, start, now);

    const snap = await prisma.videoAnalytics.create({
      data: {
        id: newId('van'),
        workspaceId,
        contentId,
        videoId: content.publishVideoId,
        periodStart: stats.periodStart,
        periodEnd: stats.periodEnd,
        views: stats.views,
        likes: stats.likes,
        comments: stats.comments,
        shares: stats.shares ?? 0,
        watchTimeMinutes: stats.watchTimeMinutes ?? 0,
        averageViewDuration: stats.averageViewDuration ?? 0,
        subscribersGained: stats.subscribersGained ?? 0,
        impressions: stats.impressions ?? 0,
        clickThroughRate: stats.clickThroughRate ?? 0,
        source: 'youtube',
      },
    });
    await prisma.$transaction(async (tx) => {
      await enqueueEvent(tx, 'AnalyticsUpdated', 'content', contentId, { analyticsId: snap.id, views: stats.views }, {});
    });
    return { ok: true, analyticsId: snap.id, views: stats.views, likes: stats.likes };
  } catch (err) {
    logger.warn({ msg: 'analytics:sync-failed', contentId, err: (err as Error).message });
    return { ok: false, error: (err as Error).message };
  }
}

export async function listAnalyticsForContent(workspaceId: string, contentId: string) {
  const c = await prisma.content.findUnique({ where: { id: contentId } });
  if (!c || c.workspaceId !== workspaceId) throw new NotFoundError('Content', contentId);
  return prisma.videoAnalytics.findMany({
    where: { contentId },
    orderBy: { periodEnd: 'desc' },
    take: 90,
  });
}
