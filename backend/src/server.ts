import './bootstrap.js';
import { env, isProduction, assertRequiredProductionProviders } from './config/env.js';
import { startServer } from './app.js';
import { logger } from './common/logger/logger.js';

async function main() {
  if (isProduction) {
    assertRequiredProductionProviders();
  }
  await startServer();
}

main().catch((err: Error) => {
  logger.fatal({ msg: 'server:fatal', err: err?.message, stack: err?.stack });
  process.exit(1);
});
