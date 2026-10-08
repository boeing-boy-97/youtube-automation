import '../bootstrap.js';
import closeWithGrace from 'close-with-grace';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { shutdownRedis } from '../config/redis.js';
import { closeQueues } from '../config/queues.js';
import { logger } from '../common/logger/logger.js';
import { startWorkers } from './index.js';

async function main() {
  await connectDatabase();
  const stopper = await startWorkers();
  logger.info({ msg: 'worker:ready' });

  closeWithGrace({ delay: 15_000 }, async ({ signal, err }) => {
    if (err) logger.error({ msg: 'worker:shutdown-error', err: err.message });
    logger.info({ msg: 'worker:shutdown-start', signal });
    await stopper();
    await closeQueues();
    await shutdownRedis();
    await disconnectDatabase();
    logger.info({ msg: 'worker:shutdown-complete' });
  });
}

main().catch((err) => {
  logger.fatal({ msg: 'worker:fatal', err: err?.message, stack: err?.stack });
  process.exit(1);
});
