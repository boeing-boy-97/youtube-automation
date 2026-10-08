import { ContentState } from '@prisma/client';
import { InvalidStateTransitionError } from '../errors/app-error.js';

// Ordered content lifecycle; terminal states are FAILED, CANCELLED, ARCHIVED, PUBLISHED
// (ARCHIVED, CANCELLED are valid terminal states even when not in the canonical progression.)
const ALLOWED_TRANSITIONS: Record<ContentState, Set<ContentState>> = {
  IDEA: new Set(['DRAFT', 'ARCHIVED', 'FAILED']),
  DRAFT: new Set(['SCRIPT_GENERATING', 'ARCHIVED', 'CANCELLED', 'FAILED']),
  SCRIPT_GENERATING: new Set(['SCRIPT_READY', 'SCRIPT_FAILED', 'CANCELLED', 'FAILED']),
  SCRIPT_READY: new Set(['VOICE_GENERATING', 'SCRIPT_REVISING', 'ARCHIVED', 'CANCELLED', 'FAILED']),
  SCRIPT_REVISING: new Set(['SCRIPT_READY', 'CANCELLED', 'FAILED']),
  SCRIPT_FAILED: new Set(['SCRIPT_GENERATING', 'DRAFT', 'ARCHIVED', 'FAILED']),
  VOICE_GENERATING: new Set(['VOICE_READY', 'VOICE_FAILED', 'CANCELLED', 'FAILED']),
  VOICE_READY: new Set(['VISUALS_GENERATING', 'VOICE_REGENERATING', 'CANCELLED', 'FAILED']),
  VOICE_REGENERATING: new Set(['VOICE_READY', 'VOICE_FAILED', 'CANCELLED', 'FAILED']),
  VOICE_FAILED: new Set(['VOICE_GENERATING', 'SCRIPT_READY', 'ARCHIVED', 'FAILED']),
  VISUALS_GENERATING: new Set(['VISUALS_READY', 'VISUALS_FAILED', 'CANCELLED', 'FAILED']),
  VISUALS_READY: new Set(['RENDERING', 'VISUALS_REGENERATING', 'CANCELLED', 'FAILED']),
  VISUALS_REGENERATING: new Set(['VISUALS_READY', 'VISUALS_FAILED', 'CANCELLED', 'FAILED']),
  VISUALS_FAILED: new Set(['VISUALS_GENERATING', 'VOICE_READY', 'ARCHIVED', 'FAILED']),
  RENDERING: new Set(['RENDERED', 'RENDER_FAILED', 'CANCELLED', 'FAILED']),
  RENDERED: new Set(['QUALITY_CHECKING', 'RENDER_FAILED', 'CANCELLED', 'FAILED']),
  RENDER_FAILED: new Set(['RENDERING', 'VISUALS_READY', 'ARCHIVED', 'FAILED']),
  QUALITY_CHECKING: new Set(['REVIEW', 'QUALITY_FAILED', 'CANCELLED', 'FAILED']),
  QUALITY_FAILED: new Set(['DRAFT', 'RENDERING', 'REVIEW', 'ARCHIVED', 'FAILED']),
  REVIEW: new Set(['APPROVED', 'REJECTED', 'CANCELLED', 'FAILED']),
  REJECTED: new Set(['DRAFT', 'REVIEW', 'ARCHIVED', 'FAILED']),
  APPROVED: new Set(['SCHEDULED', 'PUBLISHING', 'CANCELLED', 'FAILED']),
  SCHEDULED: new Set(['PUBLISHING', 'APPROVED', 'CANCELLED', 'FAILED']),
  PUBLISHING: new Set(['PUBLISHED', 'PUBLISH_FAILED', 'CANCELLED', 'FAILED']),
  PUBLISH_FAILED: new Set(['PUBLISHING', 'APPROVED', 'ARCHIVED', 'FAILED']),
  PUBLISHED: new Set(['ARCHIVED', 'FAILED']),
  CANCELLED: new Set(['DRAFT', 'ARCHIVED']),
  FAILED: new Set(['DRAFT', 'ARCHIVED']),
  ARCHIVED: new Set(['DRAFT']),
};

export function assertTransition(from: ContentState, to: ContentState): void {
  if (from === to) return;
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed || !allowed.has(to)) {
    throw new InvalidStateTransitionError(from, to);
  }
}

export function isTerminal(state: ContentState): boolean {
  return state === 'PUBLISHED' || state === 'ARCHIVED' || state === 'CANCELLED' || state === 'FAILED';
}

export function isActiveState(state: ContentState): boolean {
  return !isTerminal(state);
}

export const INITIAL_STATE: ContentState = 'IDEA';
