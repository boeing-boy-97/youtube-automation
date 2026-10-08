import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace } from '../../common/security/middleware.js';

export async function registerWorkflows(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/workflows/health', async () => ({ data: { ok: true, module: 'workflows' } }));
}
