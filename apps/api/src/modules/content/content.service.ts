import { prisma } from '../../database/prisma.js';
import { getQueue } from '../../jobs/queues/index.js';
import { newId } from '../../common/utils/ids.js';
import { enqueueEvent } from '../../events/outbox/outbox.js';
import { NotFoundError, ValidationError } from '../../common/errors/app-error.js';
import { transitionState } from './content.state.js';
import type { ContentState } from '@prisma/client';

export async function createContentFromIdea(workspaceId: string, ideaId: string, userId?: string) {
  const idea = await prisma.contentIdea.findUnique({ where: { id: ideaId } });
  if (!idea || idea.workspaceId !== workspaceId) throw new NotFoundError('Idea', ideaId);
  if (!idea.approved && !idea.rejected === false) {
    // Allow DRAFT from unapproved ideas but mark as not approved
  }

  const contentId = newId('cnt');
  const result = await prisma.$transaction(async (tx) => {
    const content = await tx.content.create({
      data: {
        id: contentId,
        workspaceId,
        ideaId,
        strategyId: idea.strategyId,
        title: idea.title,
        hook: idea.hook || undefined,
        state: 'DRAFT',
        targetDurationSec: idea.targetDurationSec,
        tags: idea.tags,
        automationMode: 'MANUAL',
        createdById: userId,
      },
    });
    await tx.contentVersion.create({
      data: { id: newId('cvr'), contentId, version: 1, snapshot: { initial: true, ideaId } as any, changedById: userId, reason: 'create' },
    });
    await enqueueEvent(tx, 'ContentCreated', 'content', contentId, { title: content.title, ideaId }, { userId });
    return content;
  });
  await dispatchPendingOutbox();
  return result;
}

export async function advanceContent(workspaceId: string, contentId: string, to: ContentState, userId?: string, metadata?: Record<string, unknown>) {
  return transitionState(prisma, { contentId, workspaceId, to, metadata, performedById: userId });
}

export async function listContent(workspaceId: string, { cursor, limit, state }: { cursor?: string; limit: number; state?: ContentState }) {
  const items = await prisma.content.findMany({
    where: { workspaceId, ...(state ? { state } : {}), deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true, title: true, state: true, hook: true, tags: true, scheduledFor: true,
      publishedAt: true, publishVideoId: true, durationSec: true, targetDurationSec: true,
      channelId: true, createdAt: true, updatedAt: true, idea: { select: { title: true, score: { select: { overall: true } } } },
    },
  });
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;
  return { data, meta: { nextCursor, limit, hasMore } };
}

export async function getContent(workspaceId: string, contentId: string) {
  const c = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      idea: { include: { score: true } },
      strategy: true,
      channel: true,
      versions: { orderBy: { version: 'desc' }, take: 10 },
      scripts: { orderBy: { createdAt: 'desc' }, take: 1 },
      scenes: { orderBy: { index: 'asc' } },
      videoProjects: { orderBy: { createdAt: 'desc' }, take: 1, include: { renderJobs: { orderBy: { createdAt: 'desc' }, take: 5 } } },
      schedule: true,
      publication: true,
      reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
      approvals: true,
    },
  });
  if (!c || c.workspaceId !== workspaceId) throw new NotFoundError('Content', contentId);
  return c;
}

export async function enqueueScriptGeneration(workspaceId: string, contentId: string, userId?: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content || content.workspaceId !== workspaceId) throw new NotFoundError('Content', contentId);
  if (!['DRAFT', 'IDEA', 'SCRIPT_FAILED'].includes(content.state)) {
    throw new ValidationError(`Cannot generate scripts from state ${content.state}`);
  }
  await transitionState(prisma, { contentId, workspaceId, to: 'SCRIPT_GENERATING', performedById: userId });
  const job = await getQueue('script-generation').add('generate-script', {
    workspaceId, contentId, userId,
  }, { jobId: `script:${contentId}:${Date.now()}`, attempts: 2 });
  return { jobId: job.id, contentId, state: 'SCRIPT_GENERATING' as const };
}

export async function enqueuePublish(workspaceId: string, contentId: string, userId?: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId }, include: { schedule: true } });
  if (!content || content.workspaceId !== workspaceId) throw new NotFoundError('Content', contentId);
  if (content.state !== 'SCHEDULED' && content.state !== 'APPROVED') {
    throw new ValidationError(`Content must be APPROVED or SCHEDULED to publish (current: ${content.state})`);
  }
  await transitionState(prisma, { contentId, workspaceId, to: 'PUBLISHING', performedById: userId });
  const job = await getQueue('publishing').add('publish', {
    workspaceId, contentId, userId, scheduledAt: content.scheduledFor?.toISOString(),
  }, { jobId: `publish:${contentId}:${Date.now()}` });
  return { jobId: job.id, state: 'PUBLISHING' as const };
}

// Helper — flush outbox immediately after an enqueue (best-effort)
import { dispatchOutbox } from '../../events/outbox/outbox.js';
async function dispatchPendingOutbox() {
  dispatchOutbox(20).catch(() => undefined);
}
