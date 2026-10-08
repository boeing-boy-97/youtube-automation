import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace } from '../../common/security/middleware.js';

export async function registerScripts(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/scripts/health', async () => ({ data: { ok: true, module: 'scripts' } }));
}
