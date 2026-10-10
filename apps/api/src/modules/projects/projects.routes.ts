import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireWorkspace, kWorkspace } from '../../common/authorization/rbac.middleware.js';
import { listProjects, getProject, createProject, deleteProject } from './projects.service.js';

export async function registerProjects(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireWorkspace);

  app.get('/projects', async (req) => {
    const w = (req as any)[kWorkspace];
    const q = z
      .object({
        limit: z.coerce.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
      .parse(req.query);
    const result = await listProjects(w.id, { limit: q.limit, cursor: q.cursor });
    return { data: result.data, meta: result.meta };
  });

  app.get('/projects/:id', async (req) => {
    const w = (req as any)[kWorkspace];
    const { id } = req.params as { id: string };
    const project = await getProject(w.id, id);
    return { data: project };
  });

  app.post('/projects', async (req) => {
    const w = (req as any)[kWorkspace];
    const body = z
      .object({
        contentId: z.string(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        fps: z.number().int().positive().optional(),
        aspectRatio: z.enum(['9:16', '1:1', '16:9']).optional(),
        templateId: z.string().optional(),
        renderSettings: z.record(z.unknown()).optional(),
      })
      .parse(req.body);
    const project = await createProject(w.id, body);
    return { data: project };
  });

  app.delete('/projects/:id', async (req) => {
    const w = (req as any)[kWorkspace];
    const { id } = req.params as { id: string };
    const result = await deleteProject(w.id, id);
    return { data: result };
  });

  app.get('/projects/health', async () => ({ data: { ok: true, module: 'projects' } }));
}
