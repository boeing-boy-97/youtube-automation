import { describe, it, expect } from 'vitest';
import { assertTransition, isTerminal, INITIAL_STATE } from '../../src/common/state/stateMachine.js';
import { ContentState } from '@prisma/client';
import { InvalidStateTransitionError } from '../../src/common/errors/AppError.js';

describe('Content state machine', () => {
  it('starts at IDEA', () => {
    expect(INITIAL_STATE).toBe('IDEA');
  });

  it('allows IDEA → DRAFT', () => {
    expect(() => assertTransition('IDEA', 'DRAFT')).not.toThrow();
  });

  it('forbids IDEA → PUBLISHED (cannot skip the pipeline)', () => {
    expect(() => assertTransition('IDEA', 'PUBLISHED')).toThrow(InvalidStateTransitionError);
  });

  it('forbids jumping from SCRIPT_READY to PUBLISHED', () => {
    expect(() => assertTransition('SCRIPT_READY', 'PUBLISHED')).toThrow(InvalidStateTransitionError);
  });

  it('allows canonical forward path', () => {
    const path: ContentState[] = [
      'IDEA','DRAFT','SCRIPT_GENERATING','SCRIPT_READY','VOICE_GENERATING','VOICE_READY',
      'VISUALS_GENERATING','VISUALS_READY','RENDERING','RENDERED','QUALITY_CHECKING','REVIEW',
      'APPROVED','SCHEDULED','PUBLISHING','PUBLISHED',
    ];
    for (let i = 1; i < path.length; i++) {
      expect(() => assertTransition(path[i-1], path[i])).not.toThrow();
    }
  });

  it('marks final states as terminal', () => {
    expect(isTerminal('PUBLISHED')).toBe(true);
    expect(isTerminal('ARCHIVED')).toBe(true);
    expect(isTerminal('CANCELLED')).toBe(true);
    expect(isTerminal('FAILED')).toBe(true);
    expect(isTerminal('DRAFT')).toBe(false);
  });

  it('allows retry from failure states (SCRIPT_FAILED -> SCRIPT_GENERATING)', () => {
    expect(() => assertTransition('SCRIPT_FAILED', 'SCRIPT_GENERATING')).not.toThrow();
  });

  it('self-transition is always allowed', () => {
    expect(() => assertTransition('PUBLISHING', 'PUBLISHING')).not.toThrow();
  });
});
