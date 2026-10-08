import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { prisma } from '../../database/prisma.js';

export async function registerPublishing(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/publishing', async (req) => {
    const w = (req as any)[kWorkspace];
    const pubs = await prisma.publication.findMany({ where: { workspaceId: w.id }, orderBy: { createdAt: 'desc' }, take: 50 });
    return { data: pubs };
  });
}
