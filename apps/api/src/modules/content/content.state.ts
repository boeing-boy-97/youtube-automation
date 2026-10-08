import type { PrismaClient, ContentState } from '@prisma/client';
import { assertTransition } from '../../common/utils/state-machine.js';
import { newId } from '../../common/utils/ids.js';

export interface TransitionOptions {
  contentId: string;
  workspaceId: string;
  to: ContentState;
  metadata?: Record<string, unknown>;
  error?: { code?: string; message?: string };
  performedById?: string;
}

type AnyClient = any;

/**
 * Transition a Content row's state. Pass a transaction client when called inside a transaction.
 * This is the ONLY code path that should mutate Content.state.
 */
export async function transitionState(
  client: AnyClient,
  opts: TransitionOptions,
): Promise<{ previous: ContentState; current: ContentState }> {
  const content = await client.content.findUnique({
    where: { id: opts.contentId },
    select: { id: true, workspaceId: true, state: true, retries: true },
  });
  if (!content) throw new Error(`Content ${opts.contentId} not found`);
  if (content.workspaceId !== opts.workspaceId) throw new Error('Cross-workspace state change denied');

  assertTransition(content.state, opts.to);
  if (content.state === opts.to) {
    return { previous: content.state, current: opts.to };
  }

  const errorStates: ContentState[] = ['SCRIPT_FAILED','VOICE_FAILED','VISUALS_FAILED','RENDER_FAILED','QUALITY_FAILED','PUBLISH_FAILED','FAILED'];
  const isError = errorStates.includes(opts.to);
  const isRetryable = ['PUBLISH_FAILED','RENDER_FAILED'].includes(opts.to);

  const data: any = {
    state: opts.to,
    previousState: content.state,
  };
  if (isError) {
    data.errorCode = opts.error?.code ?? 'ERROR';
    data.errorMessage = opts.error?.message ?? 'Unknown error';
    data.lastErrorAt = new Date();
    if (isRetryable) data.retries = { increment: 1 };
  }
  if (opts.to === 'PUBLISHED') data.publishedAt = new Date();
  if (opts.metadata) {
    // merge metadata (will be set explicitly by callers)
    data.metadata = opts.metadata;
  }

  const version = await client.contentVersion.aggregate({
    where: { contentId: opts.contentId },
    _max: { version: true },
  }).catch(() => ({ _max: { version: 0 } }));
  const nextVersion = (version?._max?.version ?? 0) + 1;

  await client.content.update({ where: { id: opts.contentId }, data });
  await client.contentVersion.create({
    data: {
      id: newId('cvr'),
      contentId: opts.contentId,
      version: nextVersion,
      snapshot: { to: opts.to, from: content.state, at: new Date().toISOString(), metadata: opts.metadata, error: opts.error },
      changedById: opts.performedById,
      reason: `state:${content.state}->${opts.to}`,
    },
  });

  return { previous: content.state, current: opts.to };
}
