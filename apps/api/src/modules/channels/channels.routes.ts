import type { FastifyInstance } from 'fastify';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { prisma } from '../../database/prisma.js';
import { NotFoundError } from '../../common/errors/app-error.js';

export async function registerChannels(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/channels/health', async () => ({ data: { ok: true, module: 'channels' } }));

  app.get('/channels', async (req) => {
    const w = (req as any)[kWorkspace];
    const channels = await prisma.youTubeChannel.findMany({
      where: { workspaceId: w.id, deletedAt: null },
      orderBy: { connectedAt: 'desc' },
      select: {
        id: true,
        providerChannelId: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        customUrl: true,
        subscriberCount: true,
        videoCount: true,
        viewCount: true,
        status: true,
        connectedAt: true,
      },
    });
    return { data: channels };
  });

  app.get('/channels/:id', async (req) => {
    const w = (req as any)[kWorkspace];
    const { id } = req.params as any;
    const channel = await prisma.youTubeChannel.findUnique({
      where: { id },
      select: {
        id: true,
        providerChannelId: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        customUrl: true,
        subscriberCount: true,
        videoCount: true,
        viewCount: true,
        status: true,
        connectedAt: true,
        workspaceId: true,
      },
    });
    if (!channel || channel.workspaceId !== w.id) throw new NotFoundError('Channel', id);
    return { data: channel };
  });
}
