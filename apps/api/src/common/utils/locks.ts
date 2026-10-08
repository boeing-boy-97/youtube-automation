import { createRequire } from 'node:module';
import type { Redis } from 'ioredis';
import { redis } from '../../config/redis.config.js';
import { logger } from '../../observability/logger.js';

const Redlock = createRequire(import.meta.url)('redlock');

// Redlock with a single Redis instance is fine for a single-instance deployment;
// add more clients for multi-master setups.
export const redlock = new Redlock(
  [redis as unknown as any],
  {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
  },
);

redlock.on('error', (err: Error) => {
  logger.error({ msg: 'redlock:error', err: err.message });
});

// Lock durations for critical sections (milliseconds)
export const LOCK_DURATIONS = {
  PUBLISH: 5 * 60_000,
  AUTOMATION_CYCLE: 2 * 60_000,
  TOKEN_REFRESH: 30_000,
  ANALYTICS_SYNC: 5 * 60_000,
  SCHEDULE_PICKUP: 30_000,
  RECONCILE: 2 * 60_000,
  RENDER: 30 * 60_000,
} as const;

export async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const lock = await redlock.acquire([`locks:${key}`], ttlMs);
  try {
    return await fn();
  } finally {
    await lock.release().catch((err: Error) => logger.warn({ msg: 'lock:release-error', key, err: err.message }));
  }
}
