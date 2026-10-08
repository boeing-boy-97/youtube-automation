import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/security/middleware.js';
import { newId } from '../../common/utils/id.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export async function registerStrategies(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/strategies', async (req) => {
    const w = (req as any)[kWorkspace];
    const items = await prisma.contentStrategy.findMany({
      where: { workspaceId: w.id, archivedAt: null }, orderBy: { createdAt: 'desc' },
    });
    return { data: items };
  });

  app.post('/strategies', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const body = z.object({
      name: z.string().min(1).max(100),
      niche: z.string().min(1).max(200),
      audience: z.string().min(1).max(500),
      tone: z.enum(['EDUCATIONAL','ENTERTAINING','INSPIRATIONAL','NEWS','TUTORIAL','STORY','COMMENTARY']).default('EDUCATIONAL'),
      hookStyle: z.string().max(200).optional(),
      avgDurationSec: z.coerce.number().int().min(15).max(600).default(60),
      topicPillars: z.array(z.string().max(60)).max(20).default([]),
      forbiddenTopics: z.array(z.string().max(60)).max(20).default([]),
      ctaTemplate: z.string().max(300).optional(),
      hashtags: z.array(z.string().max(40)).max(20).default([]),
      brandVoice: z.any().optional(),
    }).parse(req.body);
    const s = await prisma.contentStrategy.create({
      data: {
        id: newId('stg'),
        workspaceId: w.id,
        name: body.name,
        niche: body.niche,
        audience: body.audience,
        tone: body.tone,
        hookStyle: body.hookStyle,
        avgDurationSec: body.avgDurationSec,
        topicPillars: body.topicPillars,
        forbiddenTopics: body.forbiddenTopics,
        ctaTemplate: body.ctaTemplate,
        hashtags: body.hashtags,
        brandVoice: body.brandVoice,
        isDefault: false,
        createdById: u.id,
      },
    });
    return { data: s };
  });

  app.get('/strategies/:id', async (req) => {
    const w = (req as any)[kWorkspace];
    const { id } = req.params as any;
    const s = await prisma.contentStrategy.findUnique({ where: { id } });
    if (!s || s.workspaceId !== w.id) throw new NotFoundError('Strategy', id);
    return { data: s };
  });
}
