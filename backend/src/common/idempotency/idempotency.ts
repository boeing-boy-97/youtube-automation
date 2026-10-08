import type { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';
import { prisma } from '../../config/database.js';
import { newId } from '../utils/id.js';
import { logger } from '../logger/logger.js';

const HEADER = 'idempotency-key';

export async function idempotencyHook(req: FastifyRequest, reply: FastifyReply) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return;
  const raw = req.headers[HEADER];
  if (!raw || typeof raw !== 'string') return;
  if (raw.length > 128) {
    reply.code(400).send({ error: { code: 'BAD_REQUEST', message: 'Idempotency-Key too long (max 128 chars)' } });
    return reply;
  }
  // Workspace scoping: idempotency keys are unique across (workspace, key) when available
  const workspaceId = (req as any)[Symbol.for('shortforge:workspace')]?.id;
  const key = raw;

  const requestHash = crypto.createHash('sha256').update(`${req.method}:${req.url}:${JSON.stringify(req.body || {})}`).digest('base64url');

  const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
  if (existing) {
    // Key exists — only return if request hash matches (prevent key reuse across different payloads)
    if (existing.requestHash && existing.requestHash !== requestHash) {
      reply.code(422).send({ error: { code: 'IDEMPOTENCY_CONFLICT', message: 'Idempotency-Key already used with a different payload' } });
      return reply;
    }
    reply.code(existing.responseCode || 200).send(existing.responseBody || { data: { ok: true } });
    return reply;
  }
  // Store the request key early so retries collide; we'll update response after handler runs
  try {
    await prisma.idempotencyKey.create({
      data: {
        id: newId('idk'),
        key,
        workspaceId: workspaceId || null,
        requestHash,
        resourceType: (req.url as string).split('/')[2] || 'unknown',
        expiresAt: new Date(Date.now() + 24 * 3600_000),
      },
    });
  } catch (err) {
    // Race: another request just created the key
    const race = await prisma.idempotencyKey.findUnique({ where: { key } });
    if (race) {
      reply.code(race.responseCode || 200).send(race.responseBody || { data: { ok: true } });
      return reply;
    }
    logger.warn({ msg: 'idempotency:create-failed', err: (err as Error).message });
  }
  // Attach helpers so route handlers can finalize
  (req as any).__idempotency = { key, requestHash, workspaceId };
  return;
}

export async function recordIdempotentResponse(req: FastifyRequest, statusCode: number, body: unknown) {
  const ctx = (req as any).__idempotency as { key: string } | undefined;
  if (!ctx) return;
  try {
    await prisma.idempotencyKey.update({
      where: { key: ctx.key },
      data: { responseCode: statusCode, responseBody: body as any },
    });
  } catch (err) {
    logger.warn({ msg: 'idempotency:record-failed', key: ctx.key, err: (err as Error).message });
  }
}
