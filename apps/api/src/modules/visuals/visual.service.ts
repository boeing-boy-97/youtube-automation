import { prisma } from '../../database/prisma.js';
import { getStorage } from '../../providers/storage/index.js';
import { transitionState } from '../content/content.state.js';
import { trackProviderCall } from '../../observability/request-tracker.js';
import { newId } from '../../common/utils/ids.js';
import { enqueueEvent } from '../../events/outbox/outbox.js';
import { getQueue } from '../../jobs/queues/index.js';
import { NotFoundError } from '../../common/errors/app-error.js';

async function visualProvider() {
  // Lazy-imported to avoid requiring the API key until it's needed
  const mod = await import('../../providers/visuals/index.js');
  return mod.getVisual();
}

function getVisual() {
  return visualProvider();
}

export async function generateVisualsForContent(workspaceId: string, contentId: string, userId?: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { scenes: { orderBy: { index: 'asc' } } },
  });
  if (!content || content.workspaceId !== workspaceId) throw new NotFoundError('Content', contentId);
  const scenes = content.scenes;
  if (scenes.length === 0) throw new Error('No scenes to generate visuals for');

  await transitionState(prisma, { contentId, workspaceId, to: 'VISUALS_GENERATING', performedById: userId });

  const visual = await getVisual();
  const storage = getStorage();
  const width = content.width || 1080;
  const height = content.height || 1920;

  try {
    const createdAssets: string[] = [];
    for (const scene of scenes) {
      if (!scene.visualPrompt) continue;
      const result = await trackProviderCall({
        provider: 'openai', operation: 'visual.generate', model: 'gpt-image-1', workspaceId, userId,
      }, async () => {
        const img = await visual.generate({
          prompt: scene.visualPrompt!,
          width, height,
          style: 'cinematic',
          negativePrompt: 'text, watermark, distorted faces, blurry, extra limbs, nsfw',
        });
        return { result: img, usage: { estimatedCost: 0.04, sizeBytes: img.buffer.length } };
      });

      const key = storage.objectKey(workspaceId, 'images', `${scene.id}`, result.format);
      await storage.put(key, result.buffer, `image/${result.format}`);
      const asset = await prisma.asset.create({
        data: {
          id: newId('ast'),
          workspaceId,
          contentId,
          kind: 'SCENE_VISUAL',
          type: 'IMAGE',
          status: 'READY',
          storageKey: key,
          filename: `scene_${scene.index}.${result.format}`,
          mimeType: `image/${result.format}`,
          sizeBytes: result.buffer.length,
          width: result.width,
          height: result.height,
          provider: 'openai',
          model: result.model,
          prompt: scene.visualPrompt,
          createdById: userId,
        },
      });
      await prisma.sceneAsset.create({
        data: {
          id: newId('sas'),
          sceneId: scene.id,
          assetId: asset.id,
          role: 'visual',
          durationSec: scene.durationSec,
        },
      });
      createdAssets.push(asset.id);
    }

    // Also link the voiceover asset to scenes (full-track)
    const voiceAsset = await prisma.asset.findFirst({ where: { workspaceId, contentId, kind: 'VOICEOVER', status: 'READY' } });
    if (voiceAsset) {
      for (const scene of scenes) {
        const exists = await prisma.sceneAsset.findFirst({ where: { sceneId: scene.id, role: 'voiceover' } });
        if (!exists) {
          await prisma.sceneAsset.create({
            data: { id: newId('sas'), sceneId: scene.id, assetId: voiceAsset.id, role: 'voiceover', durationSec: scene.durationSec },
          });
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await transitionState(tx, { contentId, workspaceId, to: 'VISUALS_READY', performedById: userId, metadata: { visualAssets: createdAssets.length } });
      await enqueueEvent(tx, 'VisualsGenerated', 'content', contentId, { assets: createdAssets.length }, {});
    });

    // Create render project and enqueue render
    const project = await createProjectForContent(workspaceId, contentId, width, height, userId);
    const qRender = getQueue('rendering');
    await qRender.add('render-video', { workspaceId, contentId, projectId: project.id, userId });

    return { ok: true, assetCount: createdAssets.length, projectId: project.id, state: 'VISUALS_READY' as const };
  } catch (err) {
    await transitionState(prisma, {
      contentId, workspaceId, to: 'VISUALS_FAILED', performedById: userId,
      error: { code: 'VISUAL_GEN_FAILED', message: (err as Error).message },
    });
    throw err;
  }
}

async function createProjectForContent(workspaceId: string, contentId: string, width: number, height: number, userId?: string) {
  const existing = await prisma.videoProject.findFirst({ where: { contentId }, orderBy: { createdAt: 'desc' } });
  if (existing) return existing;
  const fps = 30;
  const project = await prisma.videoProject.create({
    data: {
      id: newId('vpr'),
      workspaceId,
      contentId,
      width, height, fps,
      aspectRatio: height > width ? '9:16' : '16:9',
      renderSettings: { generatedAt: new Date().toISOString() } as any,
      status: 'WAITING',
    },
  });
  return project;
}
