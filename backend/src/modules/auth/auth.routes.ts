import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { registerUser, loginUser, logoutSession, refreshSession } from './auth.service.js';
import { requireAuth, kUser } from '../../common/security/middleware.js';
import { env } from '../../config/env.js';

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8).max(200),
});
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function setAuthCookies(reply: any, accessToken: string, refreshToken: string, expiresAt: Date) {
  const isProd = env.NODE_ENV === 'production';
  reply.setCookie('sf_token', accessToken, {
    httpOnly: true,
    secure: isProd || env.COOKIE_SECURE,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    expires: expiresAt,
  });
  reply.setCookie('sf_refresh', refreshToken, {
    httpOnly: true,
    secure: isProd || env.COOKIE_SECURE,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/v1/auth/refresh',
    expires: expiresAt,
  });
}

function clearAuthCookies(reply: any) {
  reply.clearCookie('sf_token', { path: '/' });
  reply.clearCookie('sf_refresh', { path: '/api/v1/auth/refresh' });
}

export async function registerAuth(app: FastifyInstance) {
  app.post('/auth/register', async (req, reply) => {
    const body = RegisterSchema.parse(req.body);
    const result = await registerUser(body);
    setAuthCookies(reply, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.expiresAt);
    reply.code(201).send({ data: { user: result.user, workspace: result.workspace } });
  });

  app.post('/auth/login', async (req, reply) => {
    const body = LoginSchema.parse(req.body);
    const result = await loginUser(body);
    setAuthCookies(reply, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.expiresAt);
    reply.send({ data: { user: result.user, defaultWorkspace: result.defaultWorkspace } });
  });

  app.post('/auth/logout', async (req, reply) => {
    const token = req.cookies?.sf_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
    if (token) await logoutSession(token);
    clearAuthCookies(reply);
    reply.send({ data: { ok: true } });
  });

  app.post('/auth/refresh', async (req, reply) => {
    const refresh = req.cookies?.sf_refresh;
    if (!refresh) return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Refresh token required' } });
    const tokens = await refreshSession(refresh);
    setAuthCookies(reply, tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
    reply.send({ data: { ok: true } });
  });

  app.get('/auth/me', { preHandler: [requireAuth] }, async (req) => {
    const user = (req as any)[kUser];
    return { data: { user } };
  });
}
