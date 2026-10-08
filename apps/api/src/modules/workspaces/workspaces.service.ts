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
