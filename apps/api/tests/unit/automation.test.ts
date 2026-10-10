import { describe, it, expect } from 'vitest';
import { getAI } from '../../src/providers/ai/index.js';
import { getTTS } from '../../src/providers/tts/index.js';
import { getVisual } from '../../src/providers/visuals/index.js';
import { env } from '../../src/config/env.js';
import { assertTransition } from '../../src/common/utils/state-machine.js';
import { ContentState } from '@prisma/client';
import { InvalidStateTransitionError } from '../../src/common/errors/app-error.js';

describe('Provider configuration guardrails', () => {
  it('fails safely and clearly when OPENAI_API_KEY is not configured', () => {
    if (!env.OPENAI_API_KEY) {
      expect(() => getAI()).toThrow(/OPENAI_API_KEY/);
    } else {
      expect(getAI()).toBeDefined();
    }
  });

  it('fails safely and clearly when ELEVENLABS_API_KEY is not configured', () => {
    if (!env.ELEVENLABS_API_KEY) {
      expect(() => getTTS()).toThrow(/ELEVENLABS_API_KEY/);
    } else {
      expect(getTTS()).toBeDefined();
    }
  });

  it('fails safely and clearly when visual provider credentials are not configured', () => {
    if (!env.OPENAI_API_KEY) {
      expect(() => getVisual()).toThrow(/OPENAI_API_KEY/);
    } else {
      expect(getVisual()).toBeDefined();
    }
  });
});

describe('State Machine pipeline consistency', () => {
  it('enforces rigorous forward transitions across the full production pipeline', () => {
    const pipeline: ContentState[] = [
      'IDEA', 'DRAFT', 'SCRIPT_GENERATING', 'SCRIPT_READY', 'VOICE_GENERATING',
      'VOICE_READY', 'VISUALS_GENERATING', 'VISUALS_READY', 'RENDERING', 'RENDERED',
      'QUALITY_CHECKING', 'REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED'
    ];
    for (let i = 1; i < pipeline.length; i++) {
      expect(() => assertTransition(pipeline[i-1], pipeline[i])).not.toThrow();
    }
  });

  it('strictly forbids skipping intermediate production phases', () => {
    expect(() => assertTransition('DRAFT', 'PUBLISHED')).toThrow(InvalidStateTransitionError);
    expect(() => assertTransition('DRAFT', 'RENDERING')).toThrow(InvalidStateTransitionError);
    expect(() => assertTransition('IDEA', 'SCHEDULED')).toThrow(InvalidStateTransitionError);
  });
});
