import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace } from '../../common/security/middleware.js';

export async function registerVisuals(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/visuals/health', async () => ({ data: { ok: true, module: 'visuals' } }));
}
