import { PrismaClient } from '@prisma/client';
import { logger } from '../common/logger/logger.js';
import { env } from './env.js';

export const prisma = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
    ...(env.LOG_LEVEL === 'debug' ? [{ level: 'info' as const, emit: 'event' as const }, { level: 'query' as const, emit: 'event' as const }] : []),
  ],
  errorFormat: env.NODE_ENV === 'development' ? 'pretty' : 'colorless',
});

prisma.$on('warn', (e) => logger.warn({ msg: 'prisma:warn', target: e.target, message: e.message }));
prisma.$on('error', (e) => logger.error({ msg: 'prisma:error', target: e.target, message: e.message }));

if (env.LOG_LEVEL === 'debug') {
  prisma.$on('info', (e) => logger.debug({ msg: 'prisma:info', target: e.target, message: e.message }));
  prisma.$on('query', (e: any) => logger.debug({ msg: 'prisma:query', query: e.query, params: e.params, duration: e.duration }));
}

let connected = false;

export async function connectDatabase(): Promise<void> {
  if (connected) return;
  await prisma.$connect();
  connected = true;
  logger.info({ msg: 'database:connected' });
}

export async function disconnectDatabase(): Promise<void> {
  if (!connected) return;
  await prisma.$disconnect();
  connected = false;
  logger.info({ msg: 'database:disconnected' });
}

export { PrismaClient };
export type { Prisma } from '@prisma/client';
