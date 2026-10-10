import { prisma } from '../../database/prisma.js';
import { newId } from '../../common/utils/ids.js';
import { NotFoundError } from '../../common/errors/app-error.js';

export async function listWorkspacesForUser(userId: string) {
  return prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createWorkspace(userId: string, name: string, slug?: string) {
  const ws = await prisma.workspace.create({
    data: {
      id: newId('wsp'),
      name,
      slug: slug || `ws-${newId('wsp').slice(-8)}`,
      members: { create: { id: newId('wmb'), userId, role: 'OWNER' } },
    },
  });
  return ws;
}

export async function getWorkspace(workspaceId: string) {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId }, include: { _count: { select: { members: true, contents: true, channels: true } } } });
  if (!ws) throw new NotFoundError('Workspace', workspaceId);
  return ws;
}

export async function updateWorkspace(workspaceId: string, data: { name?: string; slug?: string; avatarUrl?: string | null; settings?: Record<string, any> }) {
  const existing = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!existing) throw new NotFoundError('Workspace', workspaceId);

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      ...(data.settings ? { settings: { ...((existing.settings as any) || {}), ...data.settings } } : {}),
    },
    include: { _count: { select: { members: true, contents: true, channels: true } } },
  });
  return updated;
}
