import { prisma } from '../../database/prisma.js';
import { hashPassword, verifyPassword, randomToken, hashToken, encryptString } from '../../common/utils/crypto.js';
import { UnauthorizedError, ValidationError, ConflictError } from '../../common/errors/app-error.js';
import { newId } from '../../common/utils/ids.js';
import { env } from '../../config/env.js';
import { addDays } from './date.js';

export interface AuthTokens { accessToken: string; refreshToken: string; sessionId: string; expiresAt: Date; }

export async function registerUser({ email, name, password }: { email: string; name?: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw new ConflictError('CONFLICT', 'An account with this email already exists');
  if (!isPasswordStrong(password)) throw new ValidationError('Password must be at least 8 characters');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      id: newId('usr'),
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      passwordHash,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  // Auto-create default workspace
  const workspace = await prisma.workspace.create({
    data: {
      id: newId('wsp'),
      name: `${user.name}'s Workspace`,
      slug: `ws-${user.id.slice(-8)}`,
      members: { create: { id: newId('wmb'), userId: user.id, role: 'OWNER' } },
    },
  });

  const tokens = await createSession(user.id);
  return { user, workspace, tokens };
}

export async function loginUser({ email, password }: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid credentials');
  if (user.disabled) throw new UnauthorizedError('Account disabled');
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid credentials');
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const tokens = await createSession(user.id);
  const membership = await prisma.workspaceMember.findFirst({ where: { userId: user.id }, include: { workspace: true } });
  return {
    user: { id: user.id, email: user.email, name: user.name },
    defaultWorkspace: membership?.workspace,
    tokens,
  };
}

export async function createSession(userId: string): Promise<{ accessToken: string; refreshToken: string; sessionId: string; expiresAt: Date }> {
  const accessToken = randomToken(32);
  const refreshToken = randomToken(48);
  const sessionId = newId('ses');
  const now = new Date();
  const expiresAt = addDays(now, 7);
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      tokenHash: hashToken(accessToken),
      refreshHash: hashToken(refreshToken),
      expiresAt,
    },
  });
  return { accessToken, refreshToken, sessionId, expiresAt };
}

export async function logoutSession(accessToken: string) {
  const hash = hashToken(accessToken);
  await prisma.session.updateMany({ where: { tokenHash: hash, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function refreshSession(refreshToken: string) {
  const hash = hashToken(refreshToken);
  const session = await prisma.session.findUnique({ where: { refreshHash: hash } });
  if (!session || session.revokedAt) throw new UnauthorizedError('Invalid refresh token');
  if (session.expiresAt < new Date()) throw new UnauthorizedError('Refresh token expired');
  // Rotate
  const newAccess = randomToken(32);
  const newRefresh = randomToken(48);
  const expiresAt = addDays(new Date(), 7);
  await prisma.session.update({
    where: { id: session.id },
    data: { tokenHash: hashToken(newAccess), refreshHash: hashToken(newRefresh), expiresAt, rotatedAt: new Date() },
  });
  return { accessToken: newAccess, refreshToken: newRefresh, sessionId: session.id, expiresAt };
}

export async function validateSessionToken(token: string) {
  const hash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash: hash, revokedAt: null },
    include: { user: true },
  });
  if (!session) throw new UnauthorizedError('Invalid session');
  if (session.expiresAt < new Date()) throw new UnauthorizedError('Session expired');
  prisma.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => undefined);
  return { userId: session.userId, user: session.user, sessionId: session.id };
}

function isPasswordStrong(pw: string): boolean {
  return pw.length >= 8;
}
