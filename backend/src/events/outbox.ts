import { prisma } from '../config/database.js';
import { getQueue } from '../config/queues.js';
import { logger } from '../common/logger/logger.js';
import { newId } from '../common/utils/id.js';
import type { QueueName } from '../config/queues.js';
import type { Prisma } from '@prisma/client';

const QUEUE_FOR_EVENT: Record<string, QueueName | null> = {
  ContentCreated: null,
  IdeaGenerated: 'idea-generation',
  ScriptGenerated: 'script-generation',
  VoiceGenerated: 'voice-generation',
  VisualsGenerated: 'visual-generation',
  RenderCompleted: 'rendering',
  QualityCheckCompleted: 'quality-check',
  ApprovalRequested: 'notifications',
  ContentApproved: 'notifications',
  ContentRejected: 'notifications',
  ContentScheduled: 'notifications',
  PublishStarted: 'publishing',
  PublishCompleted: 'notifications',
  PublishFailed: 'notifications',
  AnalyticsUpdated: 'performance-analysis',
  PerformanceAnalyzed: 'strategy-optimization',
  StrategyUpdated: 'notifications',
  Notification: 'notifications',
};

export async function enqueueEvent(
  tx: Prisma.TransactionClient,
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  payload: Record<string, unknown> = {},
  metadata: Record<string, unknown> = {},
) {
  await tx.outboxEvent.create({
    data: {
      id: newId('obe'),
      aggregateType,
      aggregateId,
      eventType,
      payload: payload as any,
      metadata: metadata as any,
    },
  });
}

// Dispatch due outbox events to queues. Called by a recurring BullMQ job or during idle time.
export async function dispatchOutbox(limit = 50): Promise<number> {
  const events = await prisma.outboxEvent.findMany({
    where: { published: false, scheduledFor: { lte: new Date() } },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });
  let dispatched = 0;
  for (const ev of events) {
    try {
      const queueName = QUEUE_FOR_EVENT[ev.eventType];
      if (queueName) {
        const q = getQueue(queueName);
        await q.add(ev.eventType, {
          eventId: ev.id,
          aggregateType: ev.aggregateType,
          aggregateId: ev.aggregateId,
          payload: ev.payload,
          metadata: ev.metadata,
        }, {
          attempts: 5,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: 500,
          removeOnFail: 2000,
        });
      }
      await prisma.outboxEvent.update({
        where: { id: ev.id },
        data: { published: true, publishedAt: new Date() },
      });
      dispatched++;
    } catch (err) {
      await prisma.outboxEvent.update({
        where: { id: ev.id },
        data: { attempts: { increment: 1 }, lastError: (err as Error).message },
      });
      logger.warn({ msg: 'outbox:dispatch-failed', eventId: ev.id, err: (err as Error).message });
    }
  }
  if (dispatched > 0) logger.info({ msg: 'outbox:dispatched', count: dispatched });
  return dispatched;
}
