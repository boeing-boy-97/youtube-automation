import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { scheduleContent, cancelScheduled } from './scheduling.service.js';
import { prisma } from '../../database/prisma.js';

export async function registerScheduling(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.post('/schedules', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const body = z.object({
      contentId: z.string(),
      channelId: z.string(),
      scheduledAt: z.coerce.date(),
      privacyStatus: z.enum(['private','unlisted','public']).optional(),
    }).parse(req.body);
    const r = await scheduleContent({ workspaceId: w.id, contentId: body.contentId, channelId: body.channelId, scheduledAt: body.scheduledAt, privacyStatus: body.privacyStatus, userId: u.id });
    return { data: r };
  });

  app.get('/schedules', async (req) => {
    const w = (req as any)[kWorkspace];
    const items = await prisma.schedule.findMany({
      where: { workspaceId: w.id, status: { in: ['DRAFT','SCHEDULED','PUBLISHING'] } },
      orderBy: { scheduledAt: 'asc' },
      include: { content: { select: { id: true, title: true, state: true } }, channel: { select: { id: true, title: true } } },
    });
    return { data: items };
  });

  app.delete('/schedules/:contentId', async (req, reply) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { contentId } = req.params as any;
    const r = await cancelScheduled(w.id, contentId, u.id);
    reply.send({ data: r });
  });
}
