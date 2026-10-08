import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace } from '../../common/security/middleware.js';

export async function registerAutomation(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/automation/health', async () => ({ data: { ok: true, module: 'automation' } }));
}
