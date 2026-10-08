import { prisma } from '../../database/prisma.js';
import { transitionState } from '../content/content.state.js';
import { newId } from '../../common/utils/ids.js';
import { ValidationError } from '../../common/errors/app-error.js';

export async function approveContent(workspaceId: string, contentId: string, userId: string, note?: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content || content.workspaceId !== workspaceId) throw new ValidationError('Content not found');
  if (content.state !== 'REVIEW' && content.state !== 'QUALITY_FAILED' && content.state !== 'REJECTED') {
    throw new ValidationError(`Content cannot be approved from state ${content.state}`);
  }
  await prisma.$transaction(async (tx) => {
    await tx.approval.create({
      data: {
        id: newId('apr'),
        workspaceId,
        contentId,
        approvedById: userId,
        stage: 'final',
        note,
      },
    });
    await transitionState(tx, { contentId, workspaceId, to: 'APPROVED', performedById: userId });
  });
  return { ok: true, state: 'APPROVED' as const };
}

export async function rejectContent(workspaceId: string, contentId: string, userId: string, reason: string) {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content || content.workspaceId !== workspaceId) throw new ValidationError('Content not found');
  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        id: newId('rev'),
        workspaceId,
        contentId,
        reviewerId: userId,
        decision: 'REJECTED',
        comment: reason,
      },
    });
    await transitionState(tx, { contentId, workspaceId, to: 'REJECTED', performedById: userId, metadata: { reason } });
  });
  return { ok: true, state: 'REJECTED' as const };
}
