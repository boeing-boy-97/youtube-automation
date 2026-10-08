import { prisma } from '../../database/prisma.js';
import { getYouTube, decryptTokens, encryptTokens } from '../../providers/youtube/index.js';
import { getStorage } from '../../providers/storage/index.js';
import { transitionState } from '../content/content.state.js';
import { newId } from '../../common/utils/ids.js';
import { enqueueEvent } from '../../events/outbox/outbox.js';
import { withLock, LOCK_DURATIONS } from '../../common/utils/locks.js';
import { NotFoundError, ProviderError } from '../../common/errors/app-error.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export interface PublishInput {
  workspaceId: string;
  contentId: string;
  userId?: string;
  idempotencyKey: string;
  scheduledAt?: Date;
}

export async function publishContent(input: PublishInput) {
  const { workspaceId, contentId, userId, idempotencyKey } = input;
  return withLock(`publish:${contentId}`, LOCK_DURATIONS.PUBLISH, async () => {
    // Reconciliation: check if there's already a publication with the same idempotency key
    const existingPub = await prisma.publication.findUnique({ where: { idempotencyKey } });
    if (existingPub) {
      if (existingPub.status === 'LIVE' || existingPub.status === 'UPLOADED' || existingPub.status === 'PROCESSING') {
        return { ok: true, reconciled: true, videoId: existingPub.videoId, publicationId: existingPub.id };
      }
    }

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        channel: { include: { credentials: true } },
        schedule: true,
        videoProjects: { orderBy: { createdAt: 'desc' }, take: 1, include: { renderJobs: { where: { status: 'COMPLETED' }, orderBy: { finishedAt: 'desc' }, take: 1 } } },
        scripts: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!content || content.workspaceId !== workspaceId) throw new NotFoundError('Content', contentId);
    if (!content.channelId || !content.channel) throw new ProviderError('Content has no YouTube channel assigned', { code: 'YOUTUBE_NOT_CONNECTED' });
    const channel = content.channel;
    if (!channel.credentials) throw new ProviderError('Channel credentials missing — reconnect YouTube', { code: 'YOUTUBE_TOKEN_EXPIRED' });

    const project = content.videoProjects[0];
    const renderJob = project?.renderJobs[0];
    if (!project || !renderJob?.outputKey) throw new ProviderError('No completed render for content', { code: 'CONTENT_NOT_READY' });
    const script = content.scripts[0];

    // Create Publication record idempotently
    const pub = existingPub || await prisma.publication.create({
      data: {
        id: newId('pub'),
        workspaceId,
        contentId,
        channelId: channel.id,
        title: content.title,
        description: buildDescription(content, script),
        tags: content.tags,
        privacyStatus: content.privacyStatus,
        idempotencyKey,
        status: 'PENDING_RECONCILE',
        uploadAttempts: 0,
      },
    });

    // Refresh tokens if necessary
    const yt = getYouTube();
    let tokens = decryptTokens(channel.credentials.encryptedToken);
    if (!tokens.expiryDate || tokens.expiryDate - Date.now() < 5 * 60_000) {
      if (!tokens.refreshToken) throw new ProviderError('No refresh token available; reconnect channel', { code: 'YOUTUBE_TOKEN_EXPIRED' });
      tokens = await withLock(`yt-refresh:${channel.id}`, LOCK_DURATIONS.TOKEN_REFRESH, () => yt.getTokensFromRefresh(tokens.refreshToken!));
      await prisma.youTubeCredential.update({
        where: { id: channel.credentials!.id },
        data: { encryptedToken: encryptTokens(tokens), tokenExpiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : null, lastRefreshedAt: new Date() },
      });
    }

    await transitionState(prisma, { contentId, workspaceId, to: 'PUBLISHING', performedById: userId });
    await prisma.publication.update({ where: { id: pub.id }, data: { status: 'PENDING_RECONCILE', uploadAttempts: { increment: 1 } } });

    const storage = getStorage();
    const workDir = await fs.mkdtemp(path.join(os.tmpdir(), `sf-pub-${contentId}-`));
    const localFile = path.join(workDir, 'render.mp4');
    try {
      const buf = await storage.getBuffer(renderJob.outputKey);
      await fs.writeFile(localFile, buf.body);

      const result = await yt.uploadVideo(tokens, {
        title: content.title.slice(0, 100),
        description: buildDescription(content, script),
        tags: content.tags.slice(0, 15),
        categoryId: channel.defaultCategory,
        privacyStatus: (content.privacyStatus as any) || channel.defaultPrivacy,
        filePath: localFile,
        mimeType: 'video/mp4',
        publishAt: content.scheduledFor?.getTime() ? content.scheduledFor : undefined,
      });

      await prisma.publication.update({
        where: { id: pub.id },
        data: {
          videoId: result.videoId,
          status: result.status === 'processed' ? 'LIVE' : 'UPLOADED',
          uploadedAt: new Date(),
          liveAt: result.status === 'processed' ? new Date() : undefined,
        },
      });
      await prisma.content.update({
        where: { id: contentId },
        data: { publishVideoId: result.videoId, publishedAt: result.status === 'processed' ? new Date() : null, channelId: channel.id },
      });
      await prisma.$transaction(async (tx) => {
        await transitionState(tx, { contentId, workspaceId, to: 'PUBLISHED', performedById: userId, metadata: { videoId: result.videoId, publicationId: pub.id } });
        await enqueueEvent(tx, 'PublishCompleted', 'content', contentId, { videoId: result.videoId, publicationId: pub.id }, {});
      });
      await prisma.youTubeChannel.update({ where: { id: channel.id }, data: { lastPublishAt: new Date() } });

      return { ok: true, videoId: result.videoId, publicationId: pub.id, status: 'PUBLISHED' as const };
    } catch (err) {
      await prisma.publication.update({
        where: { id: pub.id },
        data: { status: 'FAILED', failedAt: new Date(), failureReason: (err as Error).message, lastCheckAt: new Date() },
      });
      await transitionState(prisma, {
        contentId, workspaceId, to: 'PUBLISH_FAILED', performedById: userId,
        error: { code: 'PUBLISH_FAILED', message: (err as Error).message },
      });
      throw err;
    } finally {
      fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  });
}

function buildDescription(content: { description?: string | null; title: string; tags: string[] }, script?: { cta?: string | null; body?: string | null } | null): string {
  const parts: string[] = [];
  if (content.description) parts.push(content.description);
  else if (script?.body) parts.push(script.body.slice(0, 1000));
  if (script?.cta) parts.push('', script.cta);
  if (content.tags.length) parts.push('', content.tags.map((t) => `#${t.replace(/\s+/g, '')}`).join(' '));
  return parts.join('\n').slice(0, 5000);
}
