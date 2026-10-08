import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/security/middleware.js';
import { approveContent, rejectContent } from './reviews.service.js';

export async function registerReviews(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.post('/reviews/:contentId/approve', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { contentId } = req.params as any;
    const body = z.object({ note: z.string().max(1000).optional() }).parse(req.body || {});
    const r = await approveContent(w.id, contentId, u.id, body.note);
    return { data: r };
  });

  app.post('/reviews/:contentId/reject', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { contentId } = req.params as any;
    const body = z.object({ reason: z.string().min(1).max(1000) }).parse(req.body);
    const r = await rejectContent(w.id, contentId, u.id, body.reason);
    return { data: r };
  });
}
