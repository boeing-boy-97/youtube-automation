import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, kUser } from '../../common/authorization/rbac.middleware.js';
import { prisma } from '../../database/prisma.js';

export async function registerUsers(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/users/health', async () => ({ data: { ok: true, module: 'users' } }));

  app.get('/users/me', async (req) => {
    const user = (req as any)[kUser];
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        timeZone: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    return { data: profile };
  });

  app.patch('/users/me', async (req) => {
    const user = (req as any)[kUser];
    const body = z.object({
      name: z.string().min(1).max(100).optional(),
      timeZone: z.string().min(1).max(100).optional(),
      avatarUrl: z.string().url().nullable().optional(),
    }).parse(req.body);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.timeZone !== undefined ? { timeZone: body.timeZone } : {}),
        ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        timeZone: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    return { data: updated };
  });
}
