import type { FastifyInstance, FastifyRequest } from 'fastify';
import { EventEmitter } from 'node:events';
import { requireAuth, requireWorkspace } from '../../common/security/middleware.js';

// Simple in-process pub/sub for SSE. For multi-instance deployments this would be Redis pub/sub.
export const events = new EventEmitter();
events.setMaxListeners(1000);

export function broadcast(workspaceId: string, channel: string, payload: unknown) {
  events.emit(`ws:${workspaceId}`, { channel, payload, ts: new Date().toISOString() });
}

export async function registerSSE(app: FastifyInstance) {
  app.get('/events', { preHandler: [requireAuth, requireWorkspace] }, async (req: FastifyRequest, reply) => {
    const w = (req as any)[Symbol.for('shortforge:workspace')];
    const key = `ws:${w.id}`;
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');
    reply.hijack();
    reply.raw.write(`retry: 3000\n\n`);
    const listener = (data: any) => {
      reply.raw.write(`event: ${data.channel}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    events.on(key, listener);
    const heartbeat = setInterval(() => {
      try { reply.raw.write(`:ping ${Date.now()}\n\n`); } catch { clearInterval(heartbeat); }
    }, 15_000);
    req.raw.on('close', () => {
      events.off(key, listener);
      clearInterval(heartbeat);
    });
  });
}
