import { Queue } from 'bullmq';
import { createRequire } from 'node:module';
import type { Redis as IORedisType } from 'ioredis';
import { logger } from '../../observability/logger.js';
import { env } from '../../config/env.js';

const IORedis = createRequire(import.meta.url)('ioredis') as new (opts: any) => IORedisType;

// All queues per spec §34
export type QueueName =
  | 'trend-research' | 'idea-generation' | 'script-generation'
  | 'voice-generation' | 'visual-generation' | 'scene-processing'
  | 'subtitle-generation' | 'rendering' | 'quality-check'
  | 'publishing' | 'analytics-sync' | 'performance-analysis'
  | 'strategy-optimization' | 'notifications' | 'cleanup'
  | 'reconciliation' | 'automation';

export const QUEUE_NAMES: QueueName[] = [
  'trend-research', 'idea-generation', 'script-generation',
  'voice-generation', 'visual-generation', 'scene-processing',
  'subtitle-generation', 'rendering', 'quality-check',
  'publishing', 'analytics-sync', 'performance-analysis',
  'strategy-optimization', 'notifications', 'cleanup',
  'reconciliation', 'automation',
];

export const defaultJobOpts = {
  removeOnComplete: 1000,
  removeOnFail: 5000,
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 5000 },
} as const;

// Per-queue overrides for timeouts / attempts
export const QUEUE_CONFIG: Record<QueueName, { attempts?: number; timeout?: number; concurrency?: number; backoff?: number }> = {
  'trend-research':    { attempts: 3, timeout: 60_000, concurrency: 4, backoff: 5000 },
  'idea-generation':   { attempts: 3, timeout: 120_000, concurrency: 4, backoff: 5000 },
  'script-generation': { attempts: 2, timeout: 180_000, concurrency: 3, backoff: 10000 },
  'voice-generation':  { attempts: 3, timeout: 300_000, concurrency: 3, backoff: 10000 },
  'visual-generation': { attempts: 3, timeout: 300_000, concurrency: 4, backoff: 10000 },
  'scene-processing':  { attempts: 2, timeout: 120_000, concurrency: 4, backoff: 5000 },
  'subtitle-generation': { attempts: 2, timeout: 120_000, concurrency: 4, backoff: 5000 },
  'rendering':         { attempts: 2, timeout: 30 * 60_000, concurrency: env.RENDER_CONCURRENCY, backoff: 30000 },
  'quality-check':     { attempts: 2, timeout: 60_000, concurrency: 4, backoff: 5000 },
  'publishing':        { attempts: 5, timeout: 10 * 60_000, concurrency: 2, backoff: 15000 },
  'analytics-sync':    { attempts: 3, timeout: 60_000, concurrency: 2, backoff: 15000 },
  'performance-analysis': { attempts: 2, timeout: 120_000, concurrency: 2, backoff: 10000 },
  'strategy-optimization': { attempts: 2, timeout: 120_000, concurrency: 2, backoff: 10000 },
  'notifications':     { attempts: 5, timeout: 30_000, concurrency: 8, backoff: 3000 },
  'cleanup':           { attempts: 2, timeout: 5 * 60_000, concurrency: 1, backoff: 30000 },
  'reconciliation':    { attempts: 3, timeout: 2 * 60_000, concurrency: 2, backoff: 15000 },
  'automation':        { attempts: 3, timeout: 5 * 60_000, concurrency: 2, backoff: 10000 },
};

function makeRedis(): IORedisType {
  let host = 'localhost', port = 6379, password: string | undefined, db = 0;
  try {
    const u = new URL(env.REDIS_URL);
    host = u.hostname || host;
    port = Number(u.port || port);
    password = u.password ? decodeURIComponent(u.password) : undefined;
    db = u.pathname ? Number(u.pathname.slice(1)) || 0 : 0;
  } catch { /* defaults */ }
  return new IORedis({ host, port, password, db, maxRetriesPerRequest: null, enableReadyCheck: false });
}

const queues = new Map<QueueName, Queue>();

export function getQueue(name: QueueName): Queue {
  let q = queues.get(name);
  if (q) return q;
  const connection = makeRedis();
  const cfg = QUEUE_CONFIG[name];
  q = new Queue(name, {
    connection,
    defaultJobOptions: {
      ...defaultJobOpts,
      attempts: cfg.attempts ?? defaultJobOpts.attempts,
    },
  });
  q.on('error', (err) => logger.error({ msg: 'queue:error', queue: name, err: err.message }));
  queues.set(name, q);
  return q;
}

export async function closeQueues(): Promise<void> {
  for (const q of queues.values()) {
    await q.close().catch((err: Error) => logger.warn({ msg: 'queue:close-error', err: err.message }));
  }
  queues.clear();
}

export function makeWorkerConnection(): IORedisType {
  return makeRedis();
}

export type { IORedisType as RedisType };
