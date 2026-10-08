import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/security/middleware.js';
import { newId } from '../../common/utils/id.js';
import { generateOAuthState } from '../../common/crypto/crypto.js';
import { generateAuthUrl, getYouTube, encryptTokens } from '../../providers/youtube/index.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { env } from '../../config/env.js';

export async function registerYoutube(app: FastifyInstance) {
  app.post('/youtube/connect', { preHandler: [requireAuth, requireWorkspace] }, async (req, reply) => {
    const user = (req as any)[kUser];
    const workspace = (req as any)[kWorkspace];
    const body = z.object({ redirectUri: z.string().url().optional() }).parse(req.body || {});
    const redirectUri = body.redirectUri || env.GOOGLE_REDIRECT_URI;
    const state = generateOAuthState();
    await prisma.oAuthAccount.create({
      data: {
        id: newId('oac'),
        userId: user.id,
        provider: 'GOOGLE',
        providerId: `state:${state}`,
        rawProfile: { state, workspaceId: workspace.id, redirectUri } as any,
      },
    });
    const url = generateAuthUrl(redirectUri, state);
    reply.send({ data: { authUrl: url } });
  });

  app.post('/youtube/callback', { preHandler: [requireAuth, requireWorkspace] }, async (req, reply) => {
    const user = (req as any)[kUser];
    const workspace = (req as any)[kWorkspace];
    const body = z.object({ code: z.string().min(1), state: z.string().min(1), redirectUri: z.string().url().optional() }).parse(req.body);
    const oa = await prisma.oAuthAccount.findFirst({ where: { userId: user.id, providerId: `state:${body.state}` } });
    if (!oa) return reply.code(400).send({ error: { code: 'BAD_REQUEST', message: 'Invalid OAuth state' } });
    const redirectUri = (oa.rawProfile as any)?.redirectUri || body.redirectUri || env.GOOGLE_REDIRECT_URI;
    const yt = getYouTube();
    const tokens = await yt.exchangeAuthCode(body.code, redirectUri);
    const channels = await yt.listChannels(tokens);
    if (channels.length === 0) return reply.code(400).send({ error: { code: 'BAD_REQUEST', message: 'No YouTube channel found' } });
    const encToken = encryptTokens(tokens);

    const createdChannels: any[] = [];
    for (const ch of channels) {
      const existing = await prisma.youTubeChannel.findUnique({ where: { providerChannelId: ch.id } });
      if (existing) {
        // Update credential
        await prisma.youTubeCredential.upsert({
          where: { channelId: existing.id },
          create: { id: newId('ycr'), channelId: existing.id, encryptedToken: encToken, tokenExpiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : null, lastRefreshedAt: new Date() },
          update: { encryptedToken: encToken, tokenExpiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : null, lastRefreshedAt: new Date() },
        });
        const updated = await prisma.youTubeChannel.update({
          where: { id: existing.id },
          data: {
            title: ch.title,
            description: ch.description,
            thumbnailUrl: ch.thumbnails?.high || ch.thumbnails?.medium || ch.thumbnails?.default,
            customUrl: ch.customUrl,
            country: ch.country,
            subscriberCount: Number(ch.statistics?.subscriberCount || 0),
            videoCount: Number(ch.statistics?.videoCount || 0),
            viewCount: Number(ch.statistics?.viewCount || 0),
            status: 'ACTIVE',
          },
        });
        createdChannels.push(updated);
      } else {
        // Create channel first, then credential with channelId
        const channel = await prisma.youTubeChannel.create({
          data: {
            id: newId('ych'),
            workspaceId: workspace.id,
            providerChannelId: ch.id,
            title: ch.title,
            description: ch.description,
            thumbnailUrl: ch.thumbnails?.high || ch.thumbnails?.medium || ch.thumbnails?.default,
            customUrl: ch.customUrl,
            country: ch.country,
            subscriberCount: Number(ch.statistics?.subscriberCount || 0),
            videoCount: Number(ch.statistics?.videoCount || 0),
            viewCount: Number(ch.statistics?.viewCount || 0),
            defaultCategory: '22',
            defaultPrivacy: 'private',
            status: 'ACTIVE',
            connectedAt: new Date(),
          },
        });
        await prisma.youTubeCredential.create({
          data: { id: newId('ycr'), channelId: channel.id, encryptedToken: encToken, tokenExpiresAt: tokens.expiryDate ? new Date(tokens.expiryDate) : null, lastRefreshedAt: new Date() },
        });
        createdChannels.push(channel);
      }
    }

    await prisma.oAuthAccount.delete({ where: { id: oa.id } }).catch(() => undefined);
    reply.send({ data: { channels: createdChannels } });
  });

  app.get('/youtube/channels', { preHandler: [requireAuth, requireWorkspace] }, async (req) => {
    const workspace = (req as any)[kWorkspace];
    const channels = await prisma.youTubeChannel.findMany({
      where: { workspaceId: workspace.id, deletedAt: null },
      include: { credentials: { select: { id: true, tokenExpiresAt: true, lastRefreshedAt: true } } },
      orderBy: { connectedAt: 'desc' },
    });
    return { data: channels };
  });

  app.get('/youtube/channels/:id', { preHandler: [requireAuth, requireWorkspace] }, async (req) => {
    const workspace = (req as any)[kWorkspace];
    const { id } = req.params as any;
    const ch = await prisma.youTubeChannel.findUnique({ where: { id }, include: { credentials: { select: { id: true, tokenExpiresAt: true } } } });
    if (!ch || ch.workspaceId !== workspace.id) throw new NotFoundError('Channel', id);
    return { data: ch };
  });

  app.delete('/youtube/channels/:id', { preHandler: [requireAuth, requireWorkspace] }, async (req, reply) => {
    const workspace = (req as any)[kWorkspace];
    const { id } = req.params as any;
    const ch = await prisma.youTubeChannel.findUnique({ where: { id } });
    if (!ch || ch.workspaceId !== workspace.id) throw new NotFoundError('Channel', id);
    await prisma.youTubeChannel.update({ where: { id }, data: { deletedAt: new Date(), status: 'REVOKED' } });
    reply.send({ data: { ok: true } });
  });
}
