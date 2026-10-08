import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace } from '../../common/security/middleware.js';

export async function registerQuality(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/quality/health', async () => ({ data: { ok: true, module: 'quality' } }));
}
