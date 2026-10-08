/**
 * ShortForge standard API response envelopes.
 * Both Fastify API routes and frontend fetch clients conform to this contract.
 */

export interface PaginationMeta {
  cursor?: string;
  nextCursor?: string | null;
  limit: number;
  hasMore?: boolean;
  total?: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isApiError(resp: unknown): resp is ApiErrorResponse {
  return typeof resp === 'object' && resp !== null && 'error' in resp;
}
