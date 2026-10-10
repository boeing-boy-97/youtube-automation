import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { generateVisualsForContent } from './visual.service.js';

export async function registerVisuals(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/visuals/health', async () => ({ data: { ok: true, module: 'visuals' } }));

  app.post('/visuals/generate', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const body = z.object({ contentId: z.string() }).parse(req.body);
    const result = await generateVisualsForContent(w.id, body.contentId, u.id);
    return { data: result };
  });
}
