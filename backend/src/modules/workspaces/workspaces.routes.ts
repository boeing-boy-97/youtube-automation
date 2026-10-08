import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kUser, kWorkspace } from '../../common/security/middleware.js';
import { listWorkspacesForUser, createWorkspace, getWorkspace } from './workspaces.service.js';

export async function registerWorkspaces(app: FastifyInstance) {
  app.get('/workspaces', { preHandler: [requireAuth] }, async (req) => {
    const user = (req as any)[kUser];
    const memberships = await listWorkspacesForUser(user.id);
    return { data: memberships.map((m) => ({ role: m.role, workspace: m.workspace })) };
  });

  app.post('/workspaces', { preHandler: [requireAuth] }, async (req) => {
    const user = (req as any)[kUser];
    const body = z.object({ name: z.string().min(1).max(100), slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/).optional() }).parse(req.body);
    const ws = await createWorkspace(user.id, body.name, body.slug);
    return { data: ws };
  });

  app.get('/workspaces/current', { preHandler: [requireAuth, requireWorkspace] }, async (req) => {
    const w = (req as any)[kWorkspace];
    const ws = await getWorkspace(w.id);
    return { data: ws };
  });
}
