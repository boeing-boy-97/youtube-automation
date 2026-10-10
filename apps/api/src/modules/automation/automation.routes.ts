import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace, kUser } from '../../common/authorization/rbac.middleware.js';
import { runAutomationCycle } from './automation.service.js';
import { prisma } from '../../database/prisma.js';

export async function registerAutomation(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/automation/health', async () => ({ data: { ok: true, module: 'automation' } }));

  app.get('/automation/status', async (req) => {
    const w = (req as any)[kWorkspace];
    const channel = await prisma.youTubeChannel.findFirst({
      where: { workspaceId: w.id, status: 'ACTIVE', deletedAt: null },
      select: { id: true, title: true, status: true },
    });
    const pendingJobs = await prisma.renderJob.count({
      where: { workspaceId: w.id, status: { in: ['WAITING', 'ACTIVE'] } },
    });
    return {
      data: {
        workspaceId: w.id,
        channelConnected: !!channel,
        activeChannel: channel,
        pendingJobs,
      },
    };
  });

  app.post('/automation/run', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const result = await runAutomationCycle(w.id, u.id);
    return { data: result };
  });
}
