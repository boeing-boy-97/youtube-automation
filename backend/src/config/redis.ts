import { createRequire } from 'node:module';
import type { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../common/logger/logger.js';

const IORedis = createRequire(import.meta.url)('ioredis') as new (opts: any) => Redis;

function parseRedisUrl(url: string): { host: string; port: number; password?: string; db?: number } {
  try {
    const u = new URL(url);
    return {
      host: u.hostname || 'localhost',
      port: Number(u.port || 6379),
      password: u.password ? decodeURIComponent(u.password) : undefined,
      db: u.pathname ? Number(u.pathname.slice(1)) || 0 : 0,
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

export function createRedisClient(label = 'redis'): Redis {
  const cfg = parseRedisUrl(env.REDIS_URL);
  const client = new IORedis({
    host: cfg.host,
    port: cfg.port,
    password: cfg.password,
    db: cfg.db,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    reconnectOnError(err: Error) {
      logger.warn({ msg: 'redis:reconnect-on-error', label, err: err.message });
      return true;
    },
    retryStrategy(times: number) {
      return Math.min(times * 200, 5000);
    },
  });
  client.on('connect', () => logger.debug({ msg: 'redis:connect', label }));
  client.on('ready', () => logger.info({ msg: 'redis:ready', label }));
  client.on('error', (err: Error) => logger.error({ msg: 'redis:error', label, err: err.message }));
  return client;
}

export const redis: Redis = createRedisClient('main');
export type RedisClient = Redis;

export async function shutdownRedis(): Promise<void> {
  await redis.quit().catch((err: Error) => logger.warn({ msg: 'redis:quit-error', err: err.message }));
}
