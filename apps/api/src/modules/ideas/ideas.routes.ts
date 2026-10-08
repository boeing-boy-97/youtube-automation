import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../database/prisma.js';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { generateIdeas, approveIdea } from './ideas.service.js';
import { NotFoundError } from '../../common/errors/app-error.js';

export async function registerIdeas(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/ideas', async (req) => {
    const w = (req as any)[kWorkspace];
    const query = z.object({
      strategyId: z.string().optional(),
      approved: z.coerce.boolean().optional(),
      limit: z.coerce.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }).parse(req.query);
    const items = await prisma.contentIdea.findMany({
      where: { workspaceId: w.id, archivedAt: null, ...(query.strategyId ? { strategyId: query.strategyId } : {}), ...(query.approved !== undefined ? { approved: query.approved } : {}) },
      include: { score: true },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });
    const hasMore = items.length > query.limit;
    const data = hasMore ? items.slice(0, query.limit) : items;
    return { data, meta: { hasMore, nextCursor: hasMore ? data[data.length - 1].id : undefined, limit: query.limit } };
  });

  app.post('/ideas/generate', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const body = z.object({ strategyId: z.string(), count: z.coerce.number().int().min(1).max(10).default(5) }).parse(req.body);
    const result = await generateIdeas(w.id, body.strategyId, u.id, body.count);
    return { data: result };
  });

  app.post('/ideas/:id/approve', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { id } = req.params as any;
    const idea = await prisma.contentIdea.findUnique({ where: { id } });
    if (!idea || idea.workspaceId !== w.id) throw new NotFoundError('Idea', id);
    const result = await approveIdea(w.id, id, u.id);
    return { data: result };
  });

  app.post('/ideas/:id/reject', async (req, reply) => {
    const w = (req as any)[kWorkspace];
    const { id } = req.params as any;
    const body = z.object({ reason: z.string().max(500).optional() }).parse(req.body || {});
    const idea = await prisma.contentIdea.findUnique({ where: { id } });
    if (!idea || idea.workspaceId !== w.id) throw new NotFoundError('Idea', id);
    await prisma.contentIdea.update({ where: { id }, data: { rejected: true, approved: false, rejectionReason: body.reason } });
    reply.send({ data: { ok: true } });
  });
}
