import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/security/middleware.js';
import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export async function registerJobs(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/jobs/:id', async (req) => {
    const w = (req as any)[kWorkspace];
    const { id } = req.params as any;
    const job = await prisma.renderJob.findFirst({ where: { id, workspaceId: w.id } })
      || await prisma.qualityCheck.findFirst({ where: { id, workspaceId: w.id } });
    if (!job) throw new NotFoundError('Job', id);
    return { data: job };
  });

  app.get('/jobs', async (req) => {
    const w = (req as any)[kWorkspace];
    const jobs = await prisma.renderJob.findMany({
      where: { workspaceId: w.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { project: { include: { content: { select: { id: true, title: true, state: true } } } } },
    });
    return { data: jobs };
  });
}
