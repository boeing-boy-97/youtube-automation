import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { prisma } from '../../database/prisma.js';

export async function registerUsage(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/usage/health', async () => ({ data: { ok: true, module: 'usage' } }));

  app.get('/usage', async (req) => {
    const w = (req as any)[kWorkspace];
    const records = await prisma.providerUsage.findMany({
      where: { workspaceId: w.id },
      orderBy: { periodStart: 'desc' },
      take: 50,
    });

    const summary = records.reduce((acc, r) => ({
      totalCalls: acc.totalCalls + r.calls,
      totalCost: acc.totalCost + r.totalCost,
      totalTokens: acc.totalTokens + r.inputTokens + r.outputTokens,
      totalErrors: acc.totalErrors + r.errors,
    }), { totalCalls: 0, totalCost: 0, totalTokens: 0, totalErrors: 0 });

    return {
      data: {
        summary,
        records,
      },
    };
  });
}
