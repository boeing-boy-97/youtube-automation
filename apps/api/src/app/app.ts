import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import closeWithGrace from 'close-with-grace';
import { env, isProduction } from '../config/env.js';
import { logger } from '../observability/logger.js';
import { isAppError, AppError } from '../common/errors/app-error.js';
import { requestIdHook, kRequestId } from '../common/authorization/rbac.middleware.js';
import { connectDatabase, disconnectDatabase, prisma } from '../database/prisma.js';
import { shutdownRedis } from '../config/redis.config.js';
import { closeQueues } from '../jobs/queues/index.js';
import { registerHealth } from '../observability/health.js';

// Module routers
import { registerAuth } from '../modules/auth/auth.routes.js';
import { registerWorkspaces } from '../modules/workspaces/workspaces.routes.js';
import { registerYoutube } from '../modules/youtube/youtube.routes.js';
import { registerStrategies } from '../modules/strategies/strategies.routes.js';
import { registerIdeas } from '../modules/ideas/ideas.routes.js';
import { registerContent } from '../modules/content/content.routes.js';
import { registerScripts } from '../modules/scripts/scripts.routes.js';
import { registerVoices } from '../modules/voices/voices.routes.js';
import { registerAssets } from '../modules/assets/assets.routes.js';
import { registerProjects } from '../modules/projects/projects.routes.js';
import { registerRendering } from '../modules/rendering/rendering.routes.js';
import { registerQc } from '../modules/qc/qc.routes.js';
import { registerReviews } from '../modules/reviews/reviews.routes.js';
import { registerScheduling } from '../modules/scheduling/scheduling.routes.js';
import { registerPublishing } from '../modules/publishing/publishing.routes.js';
import { registerAnalytics } from '../modules/analytics/analytics.routes.js';
import { registerIntelligence } from '../modules/intelligence/intelligence.routes.js';
import { registerWorkflows } from '../modules/workflows/workflows.routes.js';
import { registerAutomation } from '../modules/automation/automation.routes.js';
import { registerNotifications } from '../modules/notifications/notifications.routes.js';
import { registerBilling } from '../modules/billing/billing.routes.js';
import { registerJobs } from '../modules/jobs/jobs.routes.js';
import { registerSSE } from '../modules/jobs/sse.js';
import { registerUsers } from '../modules/users/users.routes.js';
import { registerChannels } from '../modules/channels/channels.routes.js';
import { registerScenes } from '../modules/scenes/scenes.routes.js';
import { registerSubtitles } from '../modules/subtitles/subtitles.routes.js';
import { registerUsage } from '../modules/usage/usage.routes.js';
import { registerAudit } from '../modules/audit/audit.routes.js';
import { startWorkers } from '../jobs/index.js';

function parseCorsOrigins(s: string): string[] | boolean {
  if (!s) return true;
  if (s === '*') return true;
  return s.split(',').map((o) => o.trim()).filter(Boolean);
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024,
  });

  // Attach our pino logger
  (app as any).log = logger;

  app.addHook('onRequest', requestIdHook);
  app.addHook('onSend', async (req: FastifyRequest, reply: FastifyReply) => {
    const start = (reply as any).__startAt || Date.now();
    logger.info({
      msg: 'http:request',
      requestId: req[kRequestId],
      method: req.method,
      url: req.url,
      status: reply.statusCode,
      ms: Date.now() - start,
    });
  });
  app.addHook('onRequest', async (_req, reply) => {
    (reply as any).__startAt = Date.now();
  });

  await app.register(helmet, { contentSecurityPolicy: isProduction ? undefined : false });
  await app.register(cors, {
    origin: parseCorsOrigins(env.CORS_ORIGIN),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id', 'X-Request-Id', 'Idempotency-Key'],
  });
  await app.register(cookie, { secret: env.SESSION_SECRET });
  await app.register(jwt, { secret: env.SESSION_SECRET });
  await app.register(multipart, { limits: { fileSize: 100 * 1024 * 1024 } });
  await app.register(sensible);
  await app.register(rateLimit, {
    redis: (await import('../config/redis.config.js')).redis,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_SEC * 1000,
    keyGenerator: (req) => req.ip,
    nameSpace: 'sf-rl',
  });

  await app.register(swagger, {
    openapi: {
      info: { title: 'ShortForge API', version: '1.0.0', description: 'AI short-form video production backend' },
      servers: [{ url: `${env.API_BASE_URL}/api/v1` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          cookieAuth: { type: 'apiKey', in: 'cookie', name: 'sf_token' },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  await registerHealth(app);

  // API v1
  await app.register(async (v1) => {
    await v1.register(registerAuth);
    await v1.register(registerWorkspaces);
    await v1.register(registerYoutube);
    await v1.register(registerStrategies);
    await v1.register(registerIdeas);
    await v1.register(registerContent);
    await v1.register(registerScripts);
    await v1.register(registerVoices);
    await v1.register(registerAssets);
    await v1.register(registerProjects);
    await v1.register(registerRendering);
    await v1.register(registerQc);
    await v1.register(registerReviews);
    await v1.register(registerScheduling);
    await v1.register(registerPublishing);
    await v1.register(registerAnalytics);
    await v1.register(registerIntelligence);
    await v1.register(registerWorkflows);
    await v1.register(registerAutomation);
    await v1.register(registerNotifications);
    await v1.register(registerBilling);
    await v1.register(registerJobs);
    await v1.register(registerSSE);
    await v1.register(registerUsers);
    await v1.register(registerChannels);
    await v1.register(registerScenes);
    await v1.register(registerSubtitles);
    await v1.register(registerUsage);
    await v1.register(registerAudit);
  }, { prefix: '/api/v1' });

  app.setErrorHandler((error: Error, req: FastifyRequest, reply: FastifyReply) => {
    const requestId = req[kRequestId] || 'unknown';
    let code: string = 'INTERNAL_ERROR';
    let status = 500;
    let message = isProduction ? 'Internal server error' : error.message;
    let details: Record<string, unknown> | undefined;

    if (isAppError(error)) {
      const ae = error as AppError;
      code = ae.code;
      status = ae.status;
      message = ae.message;
      details = ae.details;
    } else if ((error as any).statusCode && (error as any).validation) {
      code = 'VALIDATION_ERROR';
      status = (error as any).statusCode;
      message = error.message;
    } else if ((error as any).statusCode) {
      status = (error as any).statusCode;
      message = error.message;
    }

    if (status >= 500) {
      logger.error({ msg: 'http:error', requestId, status, code, err: error.message, stack: error.stack });
    } else {
      logger.warn({ msg: 'http:error', requestId, status, code, message });
    }
    reply.code(status).send({
      error: {
        code,
        message,
        requestId,
        ...(details ? { details } : {}),
      },
    });
  });

  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  return app;
}

export async function startServer() {
  await connectDatabase();
  await prisma.$queryRaw`SELECT 1`;
  const app = await buildApp();

  let workerStopper: (() => Promise<void>) | undefined;
  if (env.WORKER_ENABLED === 'true') {
    workerStopper = await startWorkers();
  }

  await app.listen({ port: env.PORT, host: env.HOST });
  logger.info({ msg: 'server:listening', port: env.PORT });

  closeWithGrace({ delay: 10_000 }, async ({ signal, err }) => {
    if (err) logger.error({ msg: 'server:shutdown-error', err: (err as Error).message });
    logger.info({ msg: 'server:shutdown-start', signal });
    await app.close();
    if (workerStopper) await workerStopper();
    await closeQueues();
    await shutdownRedis();
    await disconnectDatabase();
    logger.info({ msg: 'server:shutdown-complete' });
  });

  return app;
}
