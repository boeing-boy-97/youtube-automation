import '../bootstrap.js';
import { prisma } from '../config/database.js';
import { hashPassword } from '../common/crypto/crypto.js';
import { newId } from '../common/utils/id.js';
import { logger } from '../common/logger/logger.js';

async function main() {
  logger.info({ msg: 'seed:start' });
  // Only seed if no users exist
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
  .catch((e) => { logger.error({ msg: 'seed:error', err: e?.message }); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
