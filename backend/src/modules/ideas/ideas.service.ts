import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { getAI } from '../../providers/ai/index.js';
import { newId } from '../../common/utils/id.js';
import { trackProviderCall } from '../../common/providers/requestTracker.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import { getQueue } from '../../config/queues.js';
import { enqueueEvent } from '../../events/outbox.js';
import { env } from '../../config/env.js';

const IdeaSchema = z.object({
  ideas: z.array(z.object({
    title: z.string().min(3).max(200),
    hook: z.string().min(5).max(300),
    summary: z.string().min(10).max(2000),
    angle: z.string().min(3).max(500),
    targetDurationSec: z.number().int().min(15).max(300).default(60),
    keywords: z.array(z.string().max(50)).max(20).default([]),
    score: z.object({
      hook: z.number().min(0).max(10),
      novelty: z.number().min(0).max(10),
      relevance: z.number().min(0).max(10),
      clickability: z.number().min(0).max(10),
      retention: z.number().min(0).max(10),
      productionCost: z.number().min(0).max(10),
      overall: z.number().min(0).max(10),
      reasoning: z.string().max(1000).optional(),
    }),
  })).min(1).max(10),
});

export async function generateIdeas(workspaceId: string, strategyId: string, userId?: string, count = 5) {
  const strategy = await prisma.contentStrategy.findUnique({ where: { id: strategyId } });
  if (!strategy || strategy.workspaceId !== workspaceId) throw new NotFoundError('Strategy', strategyId);
  const ai = getAI();
  const model = env.OPENAI_MODEL;

  // Pull existing recent ideas to avoid duplicates
  const recent = await prisma.contentIdea.findMany({
    where: { workspaceId, strategyId: strategy.id, archivedAt: null },
    orderBy: { createdAt: 'desc' }, take: 20, select: { title: true, summary: true },
  });

  const prompt = `Generate ${count} short-form video ideas for YouTube Shorts/TikTok/Reels.

NICHE: ${strategy.niche}
AUDIENCE: ${strategy.audience}
TONE: ${strategy.tone}
AVG DURATION: ${strategy.avgDurationSec} seconds
TOPIC PILLARS: ${(strategy.topicPillars || []).join(', ') || 'general'}
FORBIDDEN TOPICS: ${(strategy.forbiddenTopics || []).join(', ') || 'none'}
HOOK STYLE: ${strategy.hookStyle || 'curiosity-driven'}

RECENT IDEAS (avoid repeating):
${recent.map((r, i) => `${i+1}. ${r.title} — ${r.summary.slice(0, 120)}`).join('\n')}

Return a JSON object:
{
  "ideas": [{ "title", "hook", "summary", "angle", "targetDurationSec", "keywords", "score": { "hook", "novelty", "relevance", "clickability", "retention", "productionCost", "overall", "reasoning" } }]
}
Overall 0-10. Aim for variety. Hooks must stop the scroll.`;

  const out = await trackProviderCall<{ ideas: z.infer<typeof IdeaSchema>['ideas'] }>({ provider: 'openai', operation: 'ideas.generate', model, workspaceId, userId }, async () => {
    const r = await ai.chat([
      { role: 'system', content: 'You generate short-form content ideas. Return ONLY the JSON described.' },
      { role: 'user', content: prompt },
    ], { model, temperature: 0.9, responseFormat: { type: 'json_object' } });
    const validated = IdeaSchema.safeParse(r.parsed);
    if (!validated.success) return { result: { ideas: [] }, usage: r.usage };
    return { result: validated.data, usage: { inputTokens: r.usage.inputTokens, outputTokens: r.usage.outputTokens, estimatedCost: ai.estimateCost({ model, inputTokens: r.usage.inputTokens, outputTokens: r.usage.outputTokens }).usd } };
  });

  const created: any[] = [];
  for (const ideaData of out.ideas || []) {
    const idea = await prisma.contentIdea.create({
      data: {
        id: newId('ida'),
        workspaceId,
        strategyId,
        title: ideaData.title,
        hook: ideaData.hook,
        summary: ideaData.summary,
        targetDurationSec: ideaData.targetDurationSec,
        keywords: ideaData.keywords,
        angle: ideaData.angle,
        createdById: userId,
      },
    });
    await prisma.ideaScore.create({
      data: {
        id: newId('isc'),
        ideaId: idea.id,
        hook: ideaData.score.hook,
        novelty: ideaData.score.novelty,
        relevance: ideaData.score.relevance,
        clickability: ideaData.score.clickability,
        retention: ideaData.score.retention,
        productionCost: ideaData.score.productionCost,
        overall: ideaData.score.overall,
        reasoning: ideaData.score.reasoning,
        model,
      },
    });
    created.push(idea);
  }
  return { ideas: created, count: created.length };
}

export async function approveIdea(workspaceId: string, ideaId: string, userId?: string) {
  const idea = await prisma.contentIdea.findUnique({ where: { id: ideaId } });
  if (!idea || idea.workspaceId !== workspaceId) throw new NotFoundError('Idea', ideaId);
  await prisma.contentIdea.update({ where: { id: ideaId }, data: { approved: true, rejected: false } });
  // Create content and enqueue script generation
  const { createContentFromIdea, enqueueScriptGeneration } = await import('../content/content.service.js');
  const content = await createContentFromIdea(workspaceId, ideaId, userId);
  await enqueueScriptGeneration(workspaceId, content.id, userId);
  return { ok: true, contentId: content.id };
}
