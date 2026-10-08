export type ErrorCode =
  | 'VALIDATION_ERROR' | 'BAD_REQUEST'
  | 'UNAUTHORIZED' | 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'SESSION_REQUIRED'
  | 'FORBIDDEN' | 'INSUFFICIENT_PERMISSIONS' | 'CROSS_WORKSPACE_ACCESS'
  | 'NOT_FOUND' | 'RESOURCE_NOT_FOUND'
  | 'CONFLICT' | 'IDEMPOTENCY_CONFLICT' | 'DUPLICATE'
  | 'RATE_LIMITED' | 'DAILY_LIMIT_EXCEEDED'
  | 'INVALID_STATE_TRANSITION'
  | 'CONTENT_NOT_READY' | 'QC_FAILED' | 'APPROVAL_REQUIRED'
  | 'JOB_NOT_FOUND' | 'JOB_FAILED' | 'JOB_CANCELLED' | 'JOB_ALREADY_RUNNING'
  | 'PROVIDER_ERROR' | 'PROVIDER_UNAVAILABLE' | 'PROVIDER_AUTH_FAILED' | 'PROVIDER_RATE_LIMITED' | 'PROVIDER_TIMEOUT'
  | 'STORAGE_ERROR' | 'UPLOAD_INVALID' | 'FILE_NOT_FOUND'
  | 'YOUTUBE_NOT_CONNECTED' | 'YOUTUBE_TOKEN_EXPIRED' | 'YOUTUBE_QUOTA_EXCEEDED' | 'PUBLISH_DUPLICATE'
  | 'SCHEDULE_CONFLICT' | 'SCHEDULE_INVALID' | 'PUBLISH_RECONCILE_REQUIRED'
  | 'POLICY_BLOCK'
  | 'INTERNAL_ERROR';

export interface ErrorOpts {
  code: ErrorCode;
  message: string;
  status?: number;
  cause?: unknown;
  details?: Record<string, unknown>;
  retryable?: boolean;
}

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422, BAD_REQUEST: 400,
  UNAUTHORIZED: 401, INVALID_CREDENTIALS: 401, TOKEN_EXPIRED: 401, TOKEN_INVALID: 401, SESSION_REQUIRED: 401,
  FORBIDDEN: 403, INSUFFICIENT_PERMISSIONS: 403, CROSS_WORKSPACE_ACCESS: 403,
  NOT_FOUND: 404, RESOURCE_NOT_FOUND: 404,
  CONFLICT: 409, IDEMPOTENCY_CONFLICT: 409, DUPLICATE: 409,
  RATE_LIMITED: 429, DAILY_LIMIT_EXCEEDED: 429,
  INVALID_STATE_TRANSITION: 409,
  CONTENT_NOT_READY: 409, QC_FAILED: 409, APPROVAL_REQUIRED: 409,
  JOB_NOT_FOUND: 404, JOB_FAILED: 500, JOB_CANCELLED: 409, JOB_ALREADY_RUNNING: 409,
  PROVIDER_ERROR: 502, PROVIDER_UNAVAILABLE: 503, PROVIDER_AUTH_FAILED: 502, PROVIDER_RATE_LIMITED: 503, PROVIDER_TIMEOUT: 504,
  STORAGE_ERROR: 502, UPLOAD_INVALID: 400, FILE_NOT_FOUND: 404,
  YOUTUBE_NOT_CONNECTED: 409, YOUTUBE_TOKEN_EXPIRED: 409, YOUTUBE_QUOTA_EXCEEDED: 429, PUBLISH_DUPLICATE: 409,
  SCHEDULE_CONFLICT: 409, SCHEDULE_INVALID: 400, PUBLISH_RECONCILE_REQUIRED: 409,
  POLICY_BLOCK: 422,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly cause?: unknown;
  readonly details?: Record<string, unknown>;
  readonly retryable: boolean;
  readonly isOperational = true;

  constructor(opts: ErrorOpts) {
    super(opts.message);
    this.name = 'AppError';
    this.code = opts.code;
    this.status = opts.status ?? STATUS[opts.code] ?? 500;
    this.cause = opts.cause;
    this.details = opts.details;
    this.retryable = opts.retryable ?? false;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ code: 'VALIDATION_ERROR', message, status: 422, details });
  }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Authentication required') { super({ code: 'UNAUTHORIZED', message: msg, status: 401 }); }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Insufficient permissions') { super({ code: 'FORBIDDEN', message: msg, status: 403 }); }
}
export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super({ code: 'NOT_FOUND', message: id ? `${entity} "${id}" not found` : `${entity} not found`, status: 404 });
  }
}
export class ConflictError extends AppError {
  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super({ code, message, status: 409, details });
  }
}
export class RateLimitError extends AppError {
  constructor(msg = 'Too many requests') { super({ code: 'RATE_LIMITED', message: msg, status: 429, retryable: true }); }
}
export class ProviderError extends AppError {
  constructor(message: string, opts: Partial<ErrorOpts> = {}) {
    super({ code: 'PROVIDER_ERROR', message, status: 502, retryable: true, ...opts });
  }
}
export class InvalidStateTransitionError extends AppError {
  constructor(from: string, to: string) {
    super({ code: 'INVALID_STATE_TRANSITION', message: `Cannot transition from ${from} to ${to}`, status: 409, details: { from, to } });
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof Error && (err as AppError).isOperational === true;
}
