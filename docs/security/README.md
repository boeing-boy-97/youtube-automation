# Security Model

## Authentication
- Argon2id password hashing (memory-hard, not bcrypt/pbkdf2).
- Short-lived JWT access token + HttpOnly, Secure, SameSite=Lax session cookie `sf_token`.
- OAuth refresh tokens are AES-256-GCM encrypted at rest in the database; NEVER returned to the frontend.

## Authorization
- Every request to `/api/v1/*` (except auth + public webhooks) is authenticated.
- All workspace-scoped endpoints require `X-Workspace-Id` header and verify the caller is a member with the role required by the route (`requireAuth`, `requireWorkspaceRole('OWNER'|'ADMIN'|'EDITOR'|'VIEWER')` in `src/common/authorization/rbac.middleware.ts`).
- Multi-tenant isolation is enforced at the query level: every service method receives `workspaceId` and includes it in the Prisma `where` clause.

## Transport
- HTTPS-only in production (TLS terminates at the edge; cookie `Secure` flag set).
- Helmet + CORS configured with strict allow-list (`CORS_ORIGIN` env var — comma-separated).
- Rate limiting (per-IP) backed by Redis via `@fastify/rate-limit`.
- Idempotency keys for all dangerous mutations (`Idempotency-Key` header; stored + deduped).

## Secrets
- Encryption keys (`ENCRYPTION_KEY`, `ARGON2_PEPPER`, `SESSION_SECRET`) loaded from env; never logged, never in error responses.
- Provider API keys are scoped to the minimal permissions needed; stored in env/secret manager, never in the DB.
- Error responses contain **no stack traces, no SQL, no provider payloads** in any environment. Full details are written to server logs (pino structured JSON) keyed by `requestId`.

## Input validation
- Every request body/query/params validated with Zod before reaching service logic. Validation errors return 422 with `code: 'VALIDATION_ERROR'` and field-level details.

## Provider request recording
- Every external provider call is recorded in `ProviderRequest`/`ProviderUsage` tables with provider, operation, requestId, status, latency, tokens, cost, and error. This provides an audit trail and enables cost-control enforcement.
