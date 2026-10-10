import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { listAnalyticsForContent, syncAnalyticsForContent, getWorkspaceAnalyticsSummary } from './analytics.service.js';

export async function registerAnalytics(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/analytics/health', async () => ({ data: { ok: true, module: 'analytics' } }));

  app.get('/analytics/summary', async (req) => {
    const w = (req as any)[kWorkspace];
    const data = await getWorkspaceAnalyticsSummary(w.id);
    return { data };
  });

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
