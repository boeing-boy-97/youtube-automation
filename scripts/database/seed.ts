import 'dotenv/config';
import { prisma } from '../../apps/api/src/database/prisma.js';
import { hashPassword } from '../../apps/api/src/common/utils/crypto.js';
import { newId } from '../../apps/api/src/common/utils/ids.js';
import { logger } from '../../apps/api/src/observability/logger.js';

async function main() {
  logger.info({ msg: 'seed:start' });
  const existing = await prisma.user.count();
  if (existing > 0) {
    logger.info({ msg: 'seed:skip', reason: 'users already exist' });
    return;
  }
  const passwordHash = await hashPassword('password123');
  const user = await prisma.user.create({
    data: {
      id: newId('usr'),
      email: 'dev@shortforge.app',
      name: 'Dev User',
      passwordHash,
      emailVerified: true,
    },
  });
  await prisma.workspace.create({
    data: {
      id: newId('wsp'),
      name: 'Dev Workspace',
      slug: 'dev',
      tier: 'PRO',
      members: { create: { id: newId('wmb'), userId: user.id, role: 'OWNER' } },
      settings: { demo: true },
    },
  });
  logger.info({ msg: 'seed:done', user: user.email });
}

main()
  .catch((e) => { logger.error({ msg: 'seed:error', err: (e as Error)?.message }); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
