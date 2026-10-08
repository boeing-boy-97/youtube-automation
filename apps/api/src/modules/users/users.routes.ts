import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace } from '../../common/authorization/rbac.middleware.js';

export async function registerUsers(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/users/health', async () => ({ data: { ok: true, module: 'users' } }));
}
