import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace } from '../../common/security/middleware.js';
import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export async function registerQc(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);
  app.get('/qc/:contentId', async (req) => {
    const w: any = (req as any)[Symbol.for('shortforge:workspace')];
    const { contentId } = req.params as any;
    const checks = await prisma.qualityCheck.findMany({
      where: { workspaceId: w.id, contentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { issues: { orderBy: { createdAt: 'asc' } } },
    });
    if (!checks.length) throw new NotFoundError('QualityCheck', contentId);
    return { data: checks };
  });
}
