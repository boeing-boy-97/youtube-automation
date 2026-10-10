import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { prisma } from '../../database/prisma.js';
import { newId } from '../../common/utils/ids.js';
import { generateScriptForContent } from './script.service.js';
import { NotFoundError } from '../../common/errors/app-error.js';

export async function registerScripts(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/scripts/health', async () => ({ data: { ok: true, module: 'scripts' } }));

  app.get('/scripts/:contentId', async (req) => {
    const w = (req as any)[kWorkspace];
    const { contentId } = req.params as any;
    const script = await prisma.script.findFirst({
      where: { contentId, workspaceId: w.id },
      orderBy: { createdAt: 'desc' },
      include: {
        versions: { orderBy: { version: 'desc' } },
        content: { include: { scenes: { orderBy: { index: 'asc' } } } },
      },
    });
    if (!script) throw new NotFoundError('Script', contentId);
    return { data: script };
  });

  app.get('/scripts/:contentId/versions', async (req) => {
    const w = (req as any)[kWorkspace];
    const { contentId } = req.params as any;
    const script = await prisma.script.findFirst({
      where: { contentId, workspaceId: w.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!script) throw new NotFoundError('Script', contentId);
    const versions = await prisma.scriptVersion.findMany({
      where: { scriptId: script.id },
      orderBy: { version: 'desc' },
    });
    return { data: versions };
  });

  app.post('/scripts/:contentId', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { contentId } = req.params as any;
    const body = z.object({
      title: z.string().min(1).max(200).optional(),
      hook: z.string().optional(),
      body: z.string().min(1),
      cta: z.string().optional(),
      scenes: z.array(z.object({
        index: z.number().int().min(0),
        durationSec: z.number().positive(),
        narration: z.string(),
        visualPrompt: z.string().optional(),
        textOverlay: z.string().nullable().optional(),
        cta: z.string().nullable().optional(),
      })).optional(),
    }).parse(req.body);

    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content || content.workspaceId !== w.id) throw new NotFoundError('Content', contentId);

    const existing = await prisma.script.findFirst({ where: { contentId }, orderBy: { createdAt: 'desc' } });
    const nextVersion = (existing?.currentVersion ?? 0) + 1;
    const wordCount = body.body.trim().split(/\s+/).filter(Boolean).length;
    const estimatedDurationSec = Math.max(15, Math.round(wordCount / 2.5));

    const scriptId = existing ? existing.id : newId('scr');
    const scenes = body.scenes || [
      { index: 0, durationSec: 3, narration: body.hook || body.body.slice(0, 60), visualPrompt: 'Dynamic opening hook scene' },
      { index: 1, durationSec: Math.max(10, estimatedDurationSec - 6), narration: body.body, visualPrompt: 'Core visual demonstration' },
      { index: 2, durationSec: 3, narration: body.cta || 'Follow for more', visualPrompt: 'Clear engaging call to action' },
    ];

    const script = await prisma.$transaction(async (tx) => {
      const scr = existing
        ? await tx.script.update({
            where: { id: existing.id },
            data: {
              title: body.title || content.title,
              hook: body.hook || existing.hook,
              body: body.body,
              cta: body.cta || existing.cta,
              scenes: scenes as any,
              wordCount,
              estimatedDurationSec,
              currentVersion: nextVersion,
            },
          })
        : await tx.script.create({
            data: {
              id: scriptId,
              workspaceId: w.id,
              contentId,
              title: body.title || content.title,
              hook: body.hook,
              body: body.body,
              cta: body.cta,
              scenes: scenes as any,
              wordCount,
              estimatedDurationSec,
              currentVersion: nextVersion,
              createdById: u.id,
            },
          });

      await tx.scriptVersion.create({
        data: {
          id: newId('svr'),
          scriptId: scr.id,
          version: nextVersion,
          body: body.body,
          hook: body.hook,
          scenes: scenes as any,
          changedById: u.id,
        },
      });

      // Update scene table
      await tx.scene.deleteMany({ where: { contentId } });
      for (const sc of scenes) {
        await tx.scene.create({
          data: {
            id: newId('scn'),
            workspaceId: w.id,
            contentId,
            index: sc.index,
            durationSec: sc.durationSec,
            narration: sc.narration,
            visualPrompt: sc.visualPrompt || 'Cinematic vertical visual',
            textOverlay: sc.textOverlay || undefined,
            cta: sc.cta || undefined,
          },
        });
      }

      await tx.content.update({
        where: { id: contentId },
        data: {
          title: body.title || content.title,
          hook: body.hook || content.hook,
          targetDurationSec: estimatedDurationSec,
        },
      });

      return scr;
    });

    return { data: script };
  });

  app.post('/scripts/:contentId/generate', async (req) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];
    const { contentId } = req.params as any;
    const result = await generateScriptForContent(w.id, contentId, u.id);
    return { data: result };
  });
}
