import type { FastifyInstance } from 'fastify';
import path from 'node:path';
import { requireAuth, requireWorkspace, kWorkspace, kUser } from '../../common/authorization/rbac.middleware.js';
import { prisma } from '../../database/prisma.js';
import { getStorage } from '../../providers/storage/index.js';
import { newId } from '../../common/utils/ids.js';
import { NotFoundError } from '../../common/errors/app-error.js';

export async function registerAssets(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/assets/health', async () => ({ data: { ok: true, module: 'assets' } }));

  app.get('/assets', async (req) => {
    const w = (req as any)[kWorkspace];
    const assets = await prisma.asset.findMany({
      where: {
        workspaceId: w.id,
        status: { not: 'DELETED' },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { data: assets };
  });

  app.post('/assets/upload', async (req, reply) => {
    const w = (req as any)[kWorkspace];
    const u = (req as any)[kUser];

    const file = await (req as any).file();
    if (!file) {
      return reply.code(400).send({ error: { code: 'BAD_REQUEST', message: 'No file uploaded' } });
    }

    const buffer = await file.toBuffer();
    const storage = getStorage();
    const ext = path.extname(file.filename) || '.bin';
    const storageKey = `assets/${w.id}/${Date.now()}_${newId('ast')}${ext}`;

    await storage.put(storageKey, buffer, file.mimetype);

    let type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER' = 'OTHER';
    let kind: 'SCENE_VISUAL' | 'VOICEOVER' | 'MUSIC' | 'OTHER' = 'OTHER';

    if (file.mimetype.startsWith('image/')) {
      type = 'IMAGE';
      kind = 'SCENE_VISUAL';
    } else if (file.mimetype.startsWith('video/')) {
      type = 'VIDEO';
      kind = 'OTHER';
    } else if (file.mimetype.startsWith('audio/')) {
      type = 'AUDIO';
      kind = file.filename.toLowerCase().includes('music') ? 'MUSIC' : 'VOICEOVER';
    }

    const asset = await prisma.asset.create({
      data: {
        id: newId('ast'),
        workspaceId: w.id,
        kind,
        type,
        status: 'READY',
        storageKey,
        filename: file.filename,
        mimeType: file.mimetype,
        sizeBytes: buffer.length,
        createdById: u?.id,
      },
    });

    reply.code(201).send({ data: asset });
  });

  app.delete('/assets/:id', async (req, reply) => {
    const w = (req as any)[kWorkspace];
    const { id } = req.params as any;
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset || asset.workspaceId !== w.id) throw new NotFoundError('Asset', id);

    await prisma.asset.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    reply.send({ data: { ok: true } });
  });
}
