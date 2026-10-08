import { prisma } from '../../database/prisma.js';
import { getQueue } from '../../jobs/queues/index.js';
import { transitionState } from '../content/content.state.js';
import { newId } from '../../common/utils/ids.js';
import { randomToken } from '../../common/utils/crypto.js';
import { ValidationError, NotFoundError } from '../../common/errors/app-error.js';

export interface ScheduleInput {
  workspaceId: string;
  contentId: string;
  channelId: string;
  scheduledAt: Date; // UTC
  privacyStatus?: 'private' | 'unlisted' | 'public';
  userId?: string;
}

export async function scheduleContent(input: ScheduleInput) {
  const content = await prisma.content.findUnique({ where: { id: input.contentId } });
  if (!content || content.workspaceId !== input.workspaceId) throw new NotFoundError('Content', input.contentId);
  if (content.state !== 'APPROVED' && content.state !== 'SCHEDULED') {
    throw new ValidationError(`Content must be APPROVED before scheduling (current: ${content.state})`);
  }
  const channel = await prisma.youTubeChannel.findUnique({ where: { id: input.channelId } });
  if (!channel || channel.workspaceId !== input.workspaceId) throw new NotFoundError('YouTubeChannel', input.channelId);

  const delay = Math.max(0, input.scheduledAt.getTime() - Date.now());
  const idempotencyKey = `sch:${input.contentId}:${randomToken(8)}`;

  // Upsert schedule
  const existing = await prisma.schedule.findUnique({ where: { contentId: input.contentId } });
  const schedule = existing
    ? await prisma.schedule.update({
        where: { id: existing.id },
        data: {
          channelId: input.channelId,
          scheduledAt: input.scheduledAt,
          privacyStatus: input.privacyStatus || content.privacyStatus,
          status: 'SCHEDULED',
          cancelledAt: null,
          lastError: null,
        },
      })
    : await prisma.schedule.create({
        data: {
          id: newId('sch'),
          workspaceId: input.workspaceId,
          contentId: input.contentId,
          channelId: input.channelId,
          scheduledAt: input.scheduledAt,
          privacyStatus: input.privacyStatus || content.privacyStatus,
          status: 'SCHEDULED',
          idempotencyKey,
          createdById: input.userId,
        },
      });

  await prisma.content.update({
    where: { id: input.contentId },
    data: { channelId: input.channelId, scheduledFor: input.scheduledAt, privacyStatus: input.privacyStatus || content.privacyStatus },
  });
  await transitionState(prisma, { contentId: input.contentId, workspaceId: input.workspaceId, to: 'SCHEDULED', performedById: input.userId, metadata: { scheduledAt: input.scheduledAt.toISOString() } });

  // Enqueue a delayed publish job (BullMQ delay); scheduler can also pick via DB poll for redundancy.
  const q = getQueue('publishing');
  await q.add('publish', {
    workspaceId: input.workspaceId,
    contentId: input.contentId,
    userId: input.userId,
    idempotencyKey: schedule.idempotencyKey || idempotencyKey,
    scheduledAt: input.scheduledAt.toISOString(),
  }, {
    delay,
    jobId: `scheduled-publish:${input.contentId}:${input.scheduledAt.getTime()}`,
    attempts: 5,
    backoff: { type: 'exponential', delay: 15000 },
  });

  return { ok: true, scheduleId: schedule.id, scheduledAt: input.scheduledAt };
}

export async function cancelScheduled(workspaceId: string, contentId: string, userId?: string) {
  const s = await prisma.schedule.findUnique({ where: { contentId } });
  if (!s || s.workspaceId !== workspaceId) throw new NotFoundError('Schedule for content', contentId);
  await prisma.schedule.update({
    where: { id: s.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });
  await transitionState(prisma, { contentId, workspaceId, to: 'APPROVED', performedById: userId, metadata: { reason: 'schedule-cancelled' } });
  // Try to remove the BullMQ job (best effort)
  try {
    const q = getQueue('publishing');
    const job = await q.getJob(`scheduled-publish:${contentId}:${s.scheduledAt.getTime()}`);
    if (job) await job.remove();
  } catch { /* ignore */ }
  return { ok: true };
}
