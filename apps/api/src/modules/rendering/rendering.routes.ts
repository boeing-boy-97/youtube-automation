import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { renderProject } from './render.service.js';

export async function registerRendering(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/rendering/health', async () => ({ data: { ok: true, module: 'rendering' } }));

  app.post('/rendering/render', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const body = z.object({ contentId: z.string(), projectId: z.string() }).parse(req.body);
    const result = await renderProject(w.id, body.contentId, body.projectId, u.id);
    return { data: result };
  });
}
