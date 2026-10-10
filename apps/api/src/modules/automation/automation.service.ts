import { prisma } from '../../database/prisma.js';
import { generateIdeas } from '../ideas/ideas.service.js';
import { createContentFromIdea } from '../content/content.service.js';
import { generateScriptForContent } from '../scripts/script.service.js';
import { getQueue } from '../../jobs/queues/index.js';
import { newId } from '../../common/utils/ids.js';
import { NotFoundError, ValidationError } from '../../common/errors/app-error.js';

export async function getOrCreateDefaultStrategy(workspaceId: string) {
  let strategy = await prisma.contentStrategy.findFirst({
    where: { workspaceId, archivedAt: null },
    orderBy: { isDefault: 'desc' },
  });
  if (!strategy) {
    strategy = await prisma.contentStrategy.create({
      data: {
        id: newId('stg'),
        workspaceId,
        name: 'Autonomous Content Engine',
        niche: 'AI & Future Technology',
        audience: 'Modern creators and professionals',
        tone: 'EDUCATIONAL',
        topicPillars: ['AI Tools', 'Workflow Automation', 'Productivity Secrets'],
        avgDurationSec: 60,
        hookStyle: 'curiosity-driven',
        isDefault: true,
      },
    });
  }
  return strategy;
}

export async function runAutomationCycle(workspaceId: string, userId?: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) throw new NotFoundError('Workspace', workspaceId);

  const strategy = await getOrCreateDefaultStrategy(workspaceId);

  // Look for unproduced idea or generate fresh ideas
  let targetIdea = await prisma.contentIdea.findFirst({
    where: { workspaceId, approved: true, contents: { none: {} } },
    orderBy: { createdAt: 'desc' },
  });

  if (!targetIdea) {
    const generated = await generateIdeas(workspaceId, strategy.id, userId, 3);
    targetIdea = generated[0];
  }

  if (!targetIdea) {
    throw new ValidationError('Could not find or generate content idea for automation run');
  }

  // Create content draft from idea
  const content = await createContentFromIdea(workspaceId, targetIdea.id, userId);

  // Generate script
  await generateScriptForContent(workspaceId, content.id, userId);

  // Dispatch downstream worker queue for voice synthesis
  await getQueue('voice-generation').add('generate-voice', {
    workspaceId,
    contentId: content.id,
    userId,
  }, { jobId: `voice:${content.id}:${Date.now()}` });

  return {
    ok: true,
    contentId: content.id,
    title: content.title,
    state: 'SCRIPT_READY',
    ideaId: targetIdea.id,
  };
}
