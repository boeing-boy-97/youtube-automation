import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { getAI } from '../../providers/ai/index.js';
import { getStorage } from '../../providers/storage/index.js';
import { transitionState } from '../content/content.state.js';
import { trackProviderCall } from '../../common/providers/requestTracker.js';
import { newId } from '../../common/utils/id.js';
import { enqueueEvent } from '../../events/outbox.js';
import { ProviderError } from '../../common/errors/AppError.js';
import { getQueue } from '../../config/queues.js';
import { env } from '../../config/env.js';

const SCRIPT_SYSTEM_PROMPT = `You are an expert short-form video scriptwriter for YouTube Shorts, TikTok, and Reels.
You write tight, hook-driven vertical videos optimized for a TARGET DURATION in seconds.
Every script MUST follow the exact structure:
1. HOOK (first 0-3 seconds) — stops the scroll.
2. CONTEXT — what this video is about in one line.
3. VALUE — deliver the promised value in numbered or clear points.
4. PATTERN_INTERRUPT — a surprising fact, twist, or reframe.
5. CTA — clear one-line call to action.

Return a JSON object with fields:
{
  "hook": string,
  "title": string,
  "body": string, // full narration
  "scenes": [ { "index": number, "durationSec": number, "narration": string, "visualPrompt": string, "textOverlay": string|null, "cta": string|null } ],
  "cta": string,
  "tags": string[],
  "wordCount": number,
  "estimatedDurationSec": number,
  "tone": string
}
Constraints:
- Sum of scenes[*].durationSec MUST equal estimatedDurationSec within ±5%.
- visualPrompt should describe a 9:16 vertical image, cinematic, no text, safe-for-content.
- The narration must be conversational, sentence-per-breath. No run-ons.
- Never include the title in the narration. The hook is the first words spoken.`;

const ScriptSchema = z.object({
  hook: z.string().min(5).max(300),
  title: z.string().min(3).max(100),
  body: z.string().min(20).max(10000),
  scenes: z.array(z.object({
    index: z.number().int().min(0),
    durationSec: z.number().positive().max(60),
    narration: z.string().min(1).max(1000),
    visualPrompt: z.string().min(5).max(1000),
    textOverlay: z.string().max(200).nullable().optional(),
    cta: z.string().max(200).nullable().optional(),
  })).min(1).max(30),
  cta: z.string().min(2).max(300),
  tags: z.array(z.string().max(50)).max(20),
  wordCount: z.number().int().positive(),
  estimatedDurationSec: z.number().positive().max(600),
  tone: z.string().max(50),
});

export async function generateScriptForContent(workspaceId: string, contentId: string, userId?: string) {
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: { idea: true, strategy: true, channel: true },
  });
  if (!content || content.workspaceId !== workspaceId) throw new Error('Content not found in workspace');

  // Check usage/cost (simple pre-flight)
  const ai = getAI();
  const model = env.OPENAI_MODEL;

  const strategy = content.strategy;
  const idea = content.idea;

  const userPrompt = `Generate a short-form video script.

TARGET DURATION: ${content.targetDurationSec} seconds.
TITLE IDEA: ${idea?.title || content.title}
HOOK IDEA: ${idea?.hook || ''}
SUMMARY: ${idea?.summary || content.description || ''}
KEYWORDS: ${(idea?.keywords || []).join(', ')}
TONE: ${strategy?.tone || 'Educational'}
AUDIENCE: ${strategy?.audience || 'general audience'}
NICHE: ${strategy?.niche || 'general'}
CTA TEMPLATE: ${strategy?.ctaTemplate || 'Like and follow for more.'}
EXCLUDED TOPICS: ${(strategy?.forbiddenTopics || []).join(', ') || 'none'}

Return ONLY the JSON object described.`;

  try {
    const out = await trackProviderCall({
      provider: 'openai', operation: 'script.generate', model, workspaceId, userId,
    }, async () => {
      const result = await ai.chat([
        { role: 'system', content: SCRIPT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ], {
        model,
        temperature: 0.8,
        responseFormat: { type: 'json_object' },
      });
      const parsed = result.parsed;
      const validated = ScriptSchema.safeParse(parsed);
      if (!validated.success) {
        // One retry with repair prompt
        const repair = await ai.chat([
          { role: 'system', content: SCRIPT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: result.content },
          { role: 'user', content: `The previous response failed validation: ${validated.error.message}. Fix the JSON so it validates and return ONLY the corrected JSON object.` },
        ], { model, temperature: 0.3, responseFormat: { type: 'json_object' } });
        const repaired = ScriptSchema.safeParse(repair.parsed);
        if (!repaired.success) throw new ProviderError(`Script generation produced invalid JSON after repair: ${repaired.error.message}`);
        return { result: { script: repaired.data, usage: { ...repair.usage, estimatedCost: ai.estimateCost({ model, inputTokens: result.usage.inputTokens + repair.usage.inputTokens, outputTokens: result.usage.outputTokens + repair.usage.outputTokens }).usd } } };
      }
      return { result: { script: validated.data, usage: { ...result.usage, estimatedCost: ai.estimateCost({ model, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens }).usd } } };
    });

    const script = out.script;

    // Persist in a transaction + transition state
    await prisma.$transaction(async (tx) => {
      // Delete previous failed scripts? No — keep history; create new script version record.
      const existing = await tx.script.findFirst({ where: { contentId }, orderBy: { createdAt: 'desc' } });
      const nextVersion = (existing?.currentVersion ?? 0) + 1;
      const scriptId = newId('scr');
      await tx.script.create({
        data: {
          id: scriptId,
          workspaceId,
          contentId,
          title: script.title,
          hook: script.hook,
          body: script.body,
          scenes: script.scenes as any,
          cta: script.cta,
          wordCount: script.wordCount,
          estimatedDurationSec: Math.round(script.estimatedDurationSec),
          tone: script.tone,
          model,
          currentVersion: nextVersion,
          createdById: userId,
          estimatedCost: out.usage?.estimatedCost ?? 0,
          promptTokens: out.usage?.inputTokens ?? 0,
          completionTokens: out.usage?.outputTokens ?? 0,
        },
      });
      await tx.scriptVersion.create({
        data: {
          id: newId('svr'),
          scriptId,
          version: nextVersion,
          body: script.body,
          hook: script.hook,
          scenes: script.scenes as any,
          model,
          changedById: userId,
        },
      });
      // Create Scene rows from the script scenes
      await tx.scene.deleteMany({ where: { contentId } });
      for (const sc of script.scenes) {
        await tx.scene.create({
          data: {
            id: newId('scn'),
            workspaceId,
            contentId,
            index: sc.index,
            durationSec: sc.durationSec,
            narration: sc.narration,
            visualPrompt: sc.visualPrompt,
            textOverlay: sc.textOverlay || undefined,
            cta: sc.cta || undefined,
          },
        });
      }
      // Update content with derived metadata
      await tx.content.update({
        where: { id: contentId },
        data: {
          title: script.title || content.title,
          hook: script.hook || content.hook,
          durationSec: Math.round(script.estimatedDurationSec),
          tags: script.tags,
        },
      });
      await transitionState(tx, { contentId, workspaceId, to: 'SCRIPT_READY', performedById: userId, metadata: { scriptId, model } });
      await enqueueEvent(tx, 'ScriptGenerated', 'content', contentId, { scriptId, title: script.title }, { model });
    });

    // Fire voice and subtitle jobs in parallel
    const qVoice = getQueue('voice-generation');
    const qSub = getQueue('subtitle-generation');
    await qVoice.add('generate-voice', { workspaceId, contentId, userId });
    await qSub.add('generate-subtitles', { workspaceId, contentId, userId });

    return { ok: true, contentId, state: 'SCRIPT_READY' as const };
  } catch (err) {
    await transitionState(prisma, {
      contentId, workspaceId, to: 'SCRIPT_FAILED', performedById: userId,
      error: { code: 'SCRIPT_GEN_FAILED', message: (err as Error).message },
    });
    throw err;
  }
}
