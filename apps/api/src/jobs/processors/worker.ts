/**
 * Worker-only entrypoint — runs BullMQ processors without starting the HTTP server.
 * Invoked via: `npm run dev:worker` (tsx watch) or `node dist/jobs/worker.js` in production.
 */
import 'dotenv/config';
import closeWithGrace from 'close-with-grace';
import { connectDatabase, disconnectDatabase } from '../../database/prisma.js';
import { shutdownRedis } from '../../config/redis.config.js';
import { closeQueues } from '../queues/index.js';
import { logger } from '../../observability/logger.js';
import { startWorkers } from './index.js';

async function main() {
  await connectDatabase();
  logger.info({ msg: 'worker:starting' });
  const stop = await startWorkers();

  closeWithGrace({ delay: 15_000 }, async ({ err, signal }) => {
    if (err) logger.error({ msg: 'worker:shutdown-error', err: (err as Error).message });
    logger.info({ msg: 'worker:shutdown-start', signal });
    await stop();
    await closeQueues();
    await shutdownRedis();
    await disconnectDatabase();
    logger.info({ msg: 'worker:shutdown-complete' });
  });
}

main().catch((err) => {
  logger.fatal({ msg: 'worker:fatal', err: (err as Error).message, stack: (err as Error).stack });
  process.exit(1);
});
