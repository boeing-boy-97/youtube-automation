import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { prisma } from '../../database/prisma.js';
import { generateVoiceForContent } from './voice.service.js';

export async function registerVoices(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/voices/health', async () => ({ data: { ok: true, module: 'voices' } }));

  app.get('/voices', async (req) => {
    const w = (req as any)[kWorkspace];
    const voices = await prisma.voice.findMany({
      where: { workspaceId: w.id, archivedAt: null },
      orderBy: { isDefault: 'desc' },
    });
    return { data: voices };
  });

  app.post('/voices/generate', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const body = z.object({ contentId: z.string() }).parse(req.body);
    const result = await generateVoiceForContent(w.id, body.contentId, u.id);
    return { data: result };
  });
}
