import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ProviderError,
  InvalidStateTransitionError,
  isAppError,
} from '../../src/common/errors/app-error.js';

describe('AppError hierarchy', () => {
  it('instantiates generic AppError with custom code and status', () => {
    const err = new AppError({
      code: 'BAD_REQUEST',
      message: 'Invalid payload',
      status: 400,
    });
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.status).toBe(400);
    expect(err.message).toBe('Invalid payload');
    expect(err.isOperational).toBe(true);
    expect(isAppError(err)).toBe(true);
  });

  it('ValidationError defaults to 422 and VALIDATION_ERROR code', () => {
    const err = new ValidationError('Field missing', { field: 'email' });
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.status).toBe(422);
    expect(err.details).toEqual({ field: 'email' });
    expect(isAppError(err)).toBe(true);
  });

  it('UnauthorizedError defaults to 401', () => {
    const err = new UnauthorizedError();
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.status).toBe(401);
  });

  it('ForbiddenError defaults to 403', () => {
    const err = new ForbiddenError();
    expect(err.code).toBe('FORBIDDEN');
    expect(err.status).toBe(403);
  });

  it('NotFoundError builds descriptive message and defaults to 404', () => {
    const err = new NotFoundError('Workspace', 'wsp_123');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.status).toBe(404);
    expect(err.message).toContain('Workspace "wsp_123" not found');
  });

  it('RateLimitError is marked retryable with 429 status', () => {
    const err = new RateLimitError();
    expect(err.status).toBe(429);
    expect(err.retryable).toBe(true);
  });

  it('ProviderError defaults to 502 with retryable=true', () => {
    const err = new ProviderError('Upstream service error');
    expect(err.status).toBe(502);
    expect(err.retryable).toBe(true);
  });

  it('InvalidStateTransitionError captures from/to details and defaults to 409', () => {
    const err = new InvalidStateTransitionError('IDEA', 'PUBLISHED');
    expect(err.status).toBe(409);
    expect(err.code).toBe('INVALID_STATE_TRANSITION');
    expect(err.details).toEqual({ from: 'IDEA', to: 'PUBLISHED' });
  });

  it('isAppError correctly identifies standard Error vs AppError', () => {
    const stdErr = new Error('regular error');
    const appErr = new ValidationError('bad input');
    expect(isAppError(stdErr)).toBe(false);
    expect(isAppError(appErr)).toBe(true);
    expect(isAppError(null)).toBe(false);
    expect(isAppError('error string')).toBe(false);
  });
});
