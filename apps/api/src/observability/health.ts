import type { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js';
import { redis } from '../config/redis.config.js';

export async function registerHealth(app: FastifyInstance) {
  app.get('/health/live', async () => ({ status: 'ok', service: 'shortforge-api', ts: new Date().toISOString() }));

  app.get('/health/ready', async (request, reply) => {
    void request;
    const checks: Record<string, 'ok' | 'fail'> = { api: 'ok' };
    const details: Record<string, unknown> = {};
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.db = 'ok';
    } catch (err) {
      checks.db = 'fail';
      details.dbError = (err as Error).message;
    }
    try {
      const pong = await redis.ping();
      checks.redis = pong === 'PONG' ? 'ok' : 'fail';
    } catch (err) {
      checks.redis = 'fail';
      details.redisError = (err as Error).message;
    }
    const anyFail = Object.values(checks).some((s) => s === 'fail');
    reply.code(anyFail ? 503 : 200);
    return { status: anyFail ? 'degraded' : 'ok', checks, details, ts: new Date().toISOString() };
  });
}
