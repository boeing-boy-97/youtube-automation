import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/security/middleware.js';
import { prisma } from '../../config/database.js';

export async function registerPublishing(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/publishing', async (req) => {
    const w = (req as any)[kWorkspace];
    const pubs = await prisma.publication.findMany({ where: { workspaceId: w.id }, orderBy: { createdAt: 'desc' }, take: 50 });
    return { data: pubs };
  });
}
