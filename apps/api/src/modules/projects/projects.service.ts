import { prisma } from '../../database/prisma.js';
import { NotFoundError } from '../../common/errors/app-error.js';

export async function listProjects(workspaceId: string, options: { limit?: number; cursor?: string } = {}) {
  const limit = Math.min(Math.max(options.limit || 20, 1), 50);
  const items = await prisma.videoProject.findMany({
    where: { workspaceId },
    take: limit + 1,
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      content: {
        select: {
          id: true,
          title: true,
          hook: true,
          state: true,
          durationSec: true,
          aspectRatio: true,
        },
      },
      renderJobs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, status: true, progress: true, outputKey: true, createdAt: true, finishedAt: true },
      },
    },
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

  return {
    data: data.map((p) => ({
      id: p.id,
      contentId: p.contentId,
      title: p.content?.title || 'Untitled Project',
      hook: p.content?.hook,
      status: p.status,
      aspectRatio: p.aspectRatio,
      width: p.width,
      height: p.height,
      fps: p.fps,
      templateId: p.templateId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      latestRenderJob: p.renderJobs[0] || null,
    })),
    meta: { hasMore, nextCursor, limit },
  };
}

export async function getProject(workspaceId: string, projectId: string) {
  const project = await prisma.videoProject.findFirst({
    where: { id: projectId, workspaceId },
    include: {
      content: {
        include: {
          scripts: { orderBy: { version: 'desc' }, take: 1 },
          scenes: { orderBy: { index: 'asc' } },
        },
      },
      renderJobs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      qualityChecks: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!project) throw new NotFoundError('Project');
  return project;
}

export async function createProject(
  workspaceId: string,
  data: {
    contentId: string;
    width?: number;
    height?: number;
    fps?: number;
    aspectRatio?: string;
    templateId?: string;
    renderSettings?: Record<string, unknown>;
  }
) {
  // Verify content exists and belongs to workspace
  const content = await prisma.content.findFirst({
    where: { id: data.contentId, workspaceId },
  });
  if (!content) throw new NotFoundError('Content');

  const aspectRatio = data.aspectRatio || '9:16';
  const width = data.width || (aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920);
  const height = data.height || (aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : 1080);
  const fps = data.fps || 30;

  const project = await prisma.videoProject.create({
    data: {
      workspaceId,
      contentId: data.contentId,
      width,
      height,
      fps,
      aspectRatio,
      templateId: data.templateId || null,
      renderSettings: (data.renderSettings as any) || {},
    },
  });

  return project;
}

export async function deleteProject(workspaceId: string, projectId: string) {
  const project = await prisma.videoProject.findFirst({
    where: { id: projectId, workspaceId },
  });
  if (!project) throw new NotFoundError('Project');

  await prisma.videoProject.delete({
    where: { id: projectId },
  });

  return { ok: true, id: projectId };
}
