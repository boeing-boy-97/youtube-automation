import { Worker } from 'bullmq';
import { logger } from '../../observability/logger.js';
import { QUEUE_CONFIG, QUEUE_NAMES, QueueName, makeWorkerConnection } from '../queues/index.js';
import type { RedisType } from '../queues/index.js';

type Handler = (job: { data: any; id?: string; name: string }, log: (msg: string) => Promise<void>) => Promise<any>;

const handlers: Record<QueueName, Handler> = {
  'trend-research':   async () => ({ ok: true, note: 'trend-research pending' }),
  'idea-generation':  async () => ({ ok: true, note: 'idea-generation pending' }),
  'script-generation': async (job) => {
    const { generateScriptForContent } = await import('../../modules/scripts/script.service.js');
    return generateScriptForContent(job.data.workspaceId, job.data.contentId, job.data.userId);
  },
  'voice-generation': async (job) => {
    const { generateVoiceForContent } = await import('../../modules/voices/voice.service.js');
    return generateVoiceForContent(job.data.workspaceId, job.data.contentId, job.data.userId);
  },
  'visual-generation': async (job) => {
    const { generateVisualsForContent } = await import('../../modules/visuals/visual.service.js');
    return generateVisualsForContent(job.data.workspaceId, job.data.contentId, job.data.userId);
  },
  'scene-processing': async () => ({ ok: true }),
  'subtitle-generation': async () => ({ ok: true, note: 'subtitle generation placeholder; burned into next render pass' }),
  'rendering': async (job) => {
    const { renderProject } = await import('../../modules/rendering/render.service.js');
    return renderProject(job.data.workspaceId, job.data.contentId, job.data.projectId, job.data.userId);
  },
  'quality-check': async (job) => {
    const { runQualityCheck } = await import('../../modules/qc/qc.service.js');
    return runQualityCheck(job.data.workspaceId, job.data.contentId, job.data.projectId, job.data.assetId, job.data.userId);
  },
  'publishing': async (job) => {
    const { publishContent } = await import('../../modules/publishing/publishing.service.js');
    return publishContent({
      workspaceId: job.data.workspaceId,
      contentId: job.data.contentId,
      userId: job.data.userId,
      idempotencyKey: job.data.idempotencyKey || `publish:${job.data.contentId}:${Date.now()}`,
    });
  },
  'analytics-sync': async (job) => {
    const { syncAnalyticsForContent } = await import('../../modules/analytics/analytics.service.js');
    return syncAnalyticsForContent(job.data.workspaceId, job.data.contentId, job.data.userId);
  },
  'performance-analysis': async () => ({ ok: true, note: 'performance-analysis pending' }),
  'strategy-optimization': async () => ({ ok: true, note: 'strategy-optimization pending' }),
  'notifications': async () => ({ ok: true }),
  'cleanup': async () => ({ ok: true }),
  'reconciliation': async (job) => {
    const { reconcilePublications } = await import('../../modules/publishing/reconcile.service.js');
    return reconcilePublications(job.data?.workspaceId);
  },
  'automation': async () => ({ ok: true, note: 'automation orchestrator pending' }),
};

const workers: Worker[] = [];
const connections: RedisType[] = [];

export async function startWorkers(): Promise<() => Promise<void>> {
  logger.info({ msg: 'workers:starting', queues: QUEUE_NAMES });
  for (const name of QUEUE_NAMES) {
    const cfg = QUEUE_CONFIG[name];
    const conn = makeWorkerConnection();
    connections.push(conn);
    const handler = handlers[name];
    const w = new Worker(name, async (job) => {
      logger.info({ msg: 'worker:start', queue: name, jobId: job.id, name: job.name });
      const jobLog = async (msg: string) => { await job.log(msg); logger.debug({ msg: 'job:log', queue: name, jobId: job.id, log: msg }); };
      const result = await handler(job, jobLog);
      return result;
    }, {
      connection: conn,
      concurrency: cfg.concurrency || 4,
      stalledInterval: 30_000,
      maxStalledCount: 2,
    });
    w.on('failed', (job, err) => logger.error({ msg: 'worker:failed', queue: name, jobId: job?.id, err: err.message }));
    w.on('completed', (job) => logger.info({ msg: 'worker:completed', queue: name, jobId: job.id }));
    workers.push(w);
  }
  // Schedule periodic reconciliation + outbox dispatch
  setTimeout(runReconcileLoop, 60_000);
  return async () => {
    for (const w of workers) await w.close().catch(() => undefined);
    for (const c of connections) await c.quit().catch(() => undefined);
    workers.length = 0;
    connections.length = 0;
  };
}

async function runReconcileLoop() {
  try {
    const { getQueue } = await import('../queues/index.js');
    await getQueue('reconciliation').add('reconcile', {}, { repeat: { pattern: '*/5 * * * *' } });
  } catch (err) {
    logger.warn({ msg: 'reconcile:schedule-failed', err: (err as Error).message });
  }
}
