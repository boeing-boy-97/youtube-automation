import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { listAnalyticsForContent, syncAnalyticsForContent } from './analytics.service.js';

export async function registerAnalytics(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/analytics/:contentId', async (req) => {
    const w = (req as any)[kWorkspace];
    const { contentId } = req.params as any;
    const data = await listAnalyticsForContent(w.id, contentId);
    return { data };
  });

  app.post('/analytics/:contentId/sync', async (req) => {
    const w = (req as any)[kWorkspace];
    const { contentId } = req.params as any;
    const r = await syncAnalyticsForContent(w.id, contentId);
    return { data: r };
  });
}
