import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { prisma } from '../../database/prisma.js';

export async function registerAudit(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/audit/health', async () => ({ data: { ok: true, module: 'audit' } }));

  app.get('/audit', async (req) => {
    const w = (req as any)[kWorkspace];
    const logs = await prisma.auditLog.findMany({
      where: { workspaceId: w.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return { data: logs };
  });
}
