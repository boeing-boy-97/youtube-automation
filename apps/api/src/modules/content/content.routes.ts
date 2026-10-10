import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { createContentFromIdea, createContentDirect, listContent, getContent, enqueueScriptGeneration, advanceContent, enqueuePublish } from './content.service.js';

export async function registerContent(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/content', async (req) => {
    const w = (req as any)[kWorkspace];
    const q = z.object({
      state: z.string().optional(),
      limit: z.coerce.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }).parse(req.query);
    const r = await listContent(w.id, { limit: q.limit, cursor: q.cursor, state: q.state as any });
    return { data: r.data, meta: r.meta };
  });

  app.post('/content', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const body = z.union([
      z.object({ ideaId: z.string() }),
      z.object({
        title: z.string().min(1).max(200),
        hook: z.string().max(300).optional(),
        targetDurationSec: z.number().int().min(15).max(180).optional(),
        tags: z.array(z.string()).optional(),
        automationMode: z.enum(['MANUAL', 'ASSISTED', 'AUTONOMOUS']).optional(),
      }),
    ]).parse(req.body);

    if ('ideaId' in body) {
      const c = await createContentFromIdea(w.id, body.ideaId, u.id);
      return { data: c };
    } else {
      const c = await createContentDirect(w.id, body, u.id);
      return { data: c };
    }
  });

  app.get('/content/:id', async (req) => {
    const w = (req as any)[kWorkspace];
    const { id } = req.params as any;
    const c = await getContent(w.id, id);
    return { data: c };
  });

  app.post('/content/:id/generate-script', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { id } = req.params as any;
    const r = await enqueueScriptGeneration(w.id, id, u.id);
    return { data: r };
  });

  app.post('/content/:id/advance', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { id } = req.params as any;
    const body = z.object({ to: z.string() }).parse(req.body);
    const r = await advanceContent(w.id, id, body.to as any, u.id);
    return { data: r };
  });

  app.post('/content/:id/publish', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { id } = req.params as any;
    const r = await enqueuePublish(w.id, id, u.id);
    return { data: r };
  });
}
