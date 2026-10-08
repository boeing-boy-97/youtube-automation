import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace } from '../../common/authorization/rbac.middleware.js';

export async function registerUsage(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/usage/health', async () => ({ data: { ok: true, module: 'usage' } }));
}
