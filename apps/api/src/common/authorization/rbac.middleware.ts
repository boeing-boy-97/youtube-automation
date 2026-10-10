import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../database/prisma.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../errors/app-error.js';
import type { WorkspaceRole } from '@prisma/client';

// Augment Fastify request via symbol keys (avoids TS declaration conflicts)
import { randomUUID } from 'node:crypto';

export const kRequestId = Symbol.for('shortforge:requestId');
export const kUser = Symbol.for('shortforge:user');
export const kMembership = Symbol.for('shortforge:membership');
export const kWorkspace = Symbol.for('shortforge:workspace');

declare module 'fastify' {
  interface FastifyRequest {
    [kRequestId]: string;
    [kUser]?: Awaited<ReturnType<typeof loadUser>>;
    [kMembership]?: Awaited<ReturnType<typeof loadMembership>>;
    [kWorkspace]?: { id: string; name: string; slug: string; tier: string };
  }
}

async function loadUser(token: string) {
  const { hashToken } = await import('../utils/crypto.js');
  const hash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash: hash, revokedAt: null },
    include: { user: true },
  });
  if (!session) throw new UnauthorizedError('Invalid or expired session');
  if (session.expiresAt < new Date()) throw new UnauthorizedError('Session expired');
  // Touch last seen (fire-and-forget)
  prisma.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
  return { id: session.user.id, email: session.user.email, name: session.user.name, sessionId: session.id };
}

async function loadMembership(userId: string, workspaceId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    include: { workspace: true },
  });
  if (!membership) throw new ForbiddenError('You are not a member of this workspace');
  return membership;
}

export async function requestIdHook(req: FastifyRequest, _reply: FastifyReply) {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && incoming.length < 128 ? incoming : randomUUID();
  req[kRequestId] = id;
  req.id = id;
}

export async function requireAuth(req: FastifyRequest, _reply: FastifyReply) {
  const auth = req.headers.authorization;
  let token: string | undefined;
  if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  else token = req.cookies?.sf_token;
  if (!token) throw new UnauthorizedError();
  const user = await loadUser(token);
  req[kUser] = user;
}

export async function requireWorkspace(req: FastifyRequest, _reply: FastifyReply) {
  if (!req[kUser]) await requireAuth(req, _reply);
  const wsHeader = req.headers['x-workspace-id'];
  let workspaceId = typeof wsHeader === 'string' && wsHeader.trim().length > 0 ? wsHeader.trim() : undefined;
  if (!workspaceId) {
    const firstMembership = await prisma.workspaceMember.findFirst({
      where: { userId: req[kUser]!.id },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!firstMembership) throw new ForbiddenError('No active workspace found for user');
    req[kMembership] = firstMembership;
    req[kWorkspace] = {
      id: firstMembership.workspace.id,
      name: firstMembership.workspace.name,
      slug: firstMembership.workspace.slug,
      tier: firstMembership.workspace.tier,
    };
    return;
  }
  const membership = await loadMembership(req[kUser]!.id, workspaceId);
  req[kMembership] = membership;
  req[kWorkspace] = { id: membership.workspace.id, name: membership.workspace.name, slug: membership.workspace.slug, tier: membership.workspace.tier };
}

export function requireRole(...roles: WorkspaceRole[]) {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    if (!req[kMembership]) await requireWorkspace(req, _reply);
    const m = req[kMembership]!;
    if (!roles.includes(m.role)) throw new ForbiddenError(`Required role: ${roles.join(' or ')}`);
  };
}

export function getUser(req: FastifyRequest) {
  const u = req[kUser];
  if (!u) throw new UnauthorizedError();
  return u;
}
export function getWorkspace(req: FastifyRequest) {
  const w = req[kWorkspace];
  if (!w) throw new ForbiddenError('Workspace required');
  return w;
}
export function getMembership(req: FastifyRequest) {
  const m = req[kMembership];
  if (!m) throw new ForbiddenError('Membership required');
  return m;
}

// Ownership assertion helper: when a resource is loaded, verify workspaceId matches active workspace
export function assertWorkspace(resource: { workspaceId?: string } | null, req: FastifyRequest): asserts resource is { workspaceId: string } {
  if (!resource) throw new NotFoundError('Resource');
  const w = getWorkspace(req);
  if (resource.workspaceId !== w.id) throw new ForbiddenError('Cross-workspace access denied');
}
