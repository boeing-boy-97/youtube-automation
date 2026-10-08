import { prisma } from '../../config/database.js';
import { getTTS } from '../../providers/tts/index.js';
import { getStorage } from '../../providers/storage/index.js';
import { transitionState } from '../content/content.state.js';
import { trackProviderCall } from '../../common/providers/requestTracker.js';
import { newId } from '../../common/utils/id.js';
import { enqueueEvent } from '../../events/outbox.js';
import { getQueue } from '../../config/queues.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export async function generateVoiceForContent(workspaceId: string, contentId: string, userId?: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { scripts: { orderBy: { createdAt: 'desc' }, take: 1 }, scenes: { orderBy: { index: 'asc' } }, voices: { where: { isDefault: true } } },
  });
  if (!content || content.workspaceId !== workspaceId) throw new NotFoundError('Content', contentId);
  const script = content.scripts[0];
  if (!script) throw new Error('No script available for voice generation');

  // Pick a default voice or use the workspace's first voice
  let voice: NonNullable<typeof content.voices[number]> | null = content.voices[0] || null;
  if (!voice) {
    voice = await prisma.voice.findFirst({ where: { workspaceId, archivedAt: null } });
  }

  let voiceIdForProvider: string;
  const tts = getTTS();
  if (voice) {
    voiceIdForProvider = voice.providerVoiceId;
  } else {
    const voices = await tts.listVoices();
    if (voices.length === 0) throw new Error('No voices available from TTS provider');
    voiceIdForProvider = voices[0].id;
    // Persist a default voice for the workspace
    voice = await prisma.voice.create({
      data: {
        id: newId('voi'),
        workspaceId,
        contentId: content.id,
        provider: 'elevenlabs',
        providerVoiceId: voices[0].id,
        name: voices[0].name,
        isDefault: true,
        labels: voices[0].labels as any,
        previewUrl: voices[0].previewUrl,
        createdById: userId,
      },
    });
  }

  await transitionState(prisma, { contentId, workspaceId, to: 'VOICE_GENERATING', performedById: userId });
  const fullNarration = [script.hook, script.body, script.cta].filter(Boolean).join('. ');

  const voiceGen = await prisma.voiceGeneration.create({
    data: {
      id: newId('vgn'),
      workspaceId,
      voiceId: voice.id,
      contentId,
      scriptId: script.id,
      text: fullNarration,
      model: 'eleven_multilingual_v2',
      charCount: fullNarration.length,
      status: 'ACTIVE',
      startedAt: new Date(),
    },
  });

  try {
    const tts = getTTS();
    const result = await trackProviderCall({
      provider: 'elevenlabs', operation: 'tts.synthesize', model: 'eleven_multilingual_v2', workspaceId, userId,
    }, async () => {
      const synth = await tts.synthesize({ voiceId: voiceIdForProvider, text: fullNarration });
      return { result: synth, usage: { charCount: synth.charCount, estimatedCost: synth.charCount * 0.0003 } };
    });

    const storage = getStorage();
    const ext = result.format;
    const key = storage.objectKey(workspaceId, 'audio', voiceGen.id, ext);
    await storage.put(key, result.audio, `audio/${result.format}`);

    // Create Asset
    const asset = await prisma.asset.create({
      data: {
        id: newId('ast'),
        workspaceId,
        contentId,
        voiceId: voice.id,
        kind: 'VOICEOVER',
        type: 'AUDIO',
        status: 'READY',
        storageKey: key,
        filename: `voiceover_${contentId}.${ext}`,
        mimeType: `audio/${result.format}`,
        sizeBytes: result.audio.length,
        durationSec: result.durationSec || undefined,
        provider: 'elevenlabs',
        createdById: userId,
        checksum: null,
      },
    });

    await prisma.voiceGeneration.update({
      where: { id: voiceGen.id },
      data: {
        status: 'COMPLETED',
        finishedAt: new Date(),
        audioAssetId: asset.id,
        durationSec: result.durationSec || undefined,
      },
    });

    await prisma.$transaction(async (tx) => {
      await transitionState(tx, { contentId, workspaceId, to: 'VOICE_READY', performedById: userId, metadata: { voiceId: voice!.id, assetId: asset.id } });
      await enqueueEvent(tx, 'VoiceGenerated', 'content', contentId, { assetId: asset.id, voiceId: voice!.id }, {});
    });

    // Next: visuals
    const qVisuals = getQueue('visual-generation');
    await qVisuals.add('generate-visuals', { workspaceId, contentId, userId });

    return { ok: true, assetId: asset.id, state: 'VOICE_READY' as const };
  } catch (err) {
    await prisma.voiceGeneration.update({
      where: { id: voiceGen.id },
      data: { status: 'FAILED', errorMessage: (err as Error).message, finishedAt: new Date() },
    });
    await transitionState(prisma, {
      contentId, workspaceId, to: 'VOICE_FAILED', performedById: userId,
      error: { code: 'VOICE_GEN_FAILED', message: (err as Error).message },
    });
    throw err;
  }
}
