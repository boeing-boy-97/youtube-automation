# ShortForge Backend

Production-grade autonomous short-form video production backend. Real services only — no mocks, no demo simulations, no fake progress.

## Stack

- **Runtime:** Node.js 20+ / TypeScript / ESM
- **HTTP:** Fastify v5 with Helmet, CORS, JWT, Cookie sessions, Rate-limit, Multipart, Swagger/OpenAPI
- **Database:** PostgreSQL 16 via Prisma 5
- **Queue / Cache / Locks:** Redis 7 with BullMQ and Redlock
- **AI:** OpenAI (GPT-4o-mini / GPT-4o, structured outputs, image generation)
- **TTS:** ElevenLabs
- **Storage:** AWS S3 / R2 (or local disk for dev) — signed upload URLs, MIME/size validation
- **Rendering:** Real FFmpeg / ffprobe (argument-array only — never shell-concatenated)
- **Email:** Resend
- **YouTube:** googleapis youtube v3 + analytics, AES-256-GCM encrypted refresh tokens at rest
- **Passwords:** Argon2id (memory-hard, peppered)

## Architecture

- **Modular monolith** under `src/modules/*`. Each module owns its routes, service, and types.
- **Async-first.** All long-running work (AI, TTS, rendering, publishing) goes through BullMQ queues (`src/config/queues.ts`, `src/workers/`). The API creates a job and returns immediately; workers update state and emit events.
- **Multi-tenant.** Every workspace-owned row has `workspaceId`; all queries are scoped by the authenticated session's workspace; `x-workspace-id` is required and validated.
- **RBAC.** Roles are OWNER / ADMIN / EDITOR / REVIEWER / VIEWER; middleware enforces role gates per route.
- **Content state machine** (20 states): `IDEA → DRAFT → SCRIPT_GENERATING → … → PUBLISHED`. Invalid transitions throw `InvalidStateTransitionError`.
- **Provider abstractions.** All external services behind interfaces under `src/providers/`. No silent fallback; production fails fast if credentials are missing.
- **Idempotency.** `Idempotency-Key` header support, unique `idempotencyKey` on publications, reconciliation before retrying YouTube uploads.
- **Distributed locking** (Redlock) for publishing, automation, analytics sync, token refresh, scheduled execution.
- **Outbox pattern** for DB → event/queue consistency.
- **Immutable audit log** (AuditLog) for every mutation that changes state.
- **Encrypted credentials.** OAuth refresh tokens encrypted at rest with AES-256-GCM; never returned to clients.
- **Cost tracking.** Every provider call logged to `ProviderRequest`/`UsageRecord` with tokens, duration, and estimated USD cost.
- **Cursor pagination only** — no unbounded collections.
- **Observability:** Pino structured logging (redacted), `/health/live` + `/health/ready`, BullMQ job metrics, requestId propagation.
- **Graceful shutdown.** Stop accepting, drain in-flight, close workers → queues → Redis → PG → HTTP.

## Directory Layout

```
src/
  app.ts               Fastify app + plugins
  server.ts            API entrypoint
  bootstrap.ts         dotenv loader
  config/              env, database, redis, queues
  common/              errors, logger, crypto, state machine, pagination, RBAC middleware
  observability/       health
  providers/           AI / TTS / Visual / Storage / Email / YouTube / Rendering adapters
  modules/             Auth, Workspaces, YouTube, Strategies, Ideas, Content, Scripts,
                       Voices, Assets, Projects, Rendering, QC, Reviews, Scheduling,
                       Publishing, Analytics, Intelligence, Workflows, Automation,
                       Notifications, Billing, Jobs
  workers/             BullMQ workers (in-process in API, or standalone via run-worker.ts)
  jobs/                Job handlers (per-queue)
  events/              Outbox/domain event dispatcher
prisma/
  schema.prisma        Source of truth for all 50+ models and enums
scripts/
  seed.ts              Creates one dev user/workspace (no fake analytics)
docker/                Dockerfile.api, Dockerfile.worker
docker-compose.yml     Local Postgres + Redis
```

## Getting Started (Dev)

```bash
cp .env.example .env       # or use the pre-filled dev .env
npm install
# Start postgres + redis (requires docker), or run your own:
docker compose up -d
npx prisma migrate dev     # or `npm run db:push` for a throwaway dev DB
npm run db:seed            # creates dev@shortforge.app / password123
npm run dev                # API + in-process workers on :4000
```

Workers can also run standalone:

```bash
npm run dev:worker
```

## API

- All routes under `/api/v1/`.
- Response envelope: `{ data, meta }` for success, `{ error: { code, message, requestId, details? } }` for errors.
- OpenAPI docs at `/docs`.
- Auth via `sf_token` httpOnly cookie or `Authorization: Bearer <token>`.
- Workspace selection via `x-workspace-id` header after auth.

## Non-negotiables enforced by code

1. **No shell concat in FFmpeg.** All invocations use argument arrays via `child_process.spawn`.
2. **No plaintext secrets in DB.** OAuth credentials encrypted with AES-256-GCM; password hashes via Argon2id with pepper.
3. **No fake providers in `src/`.** All production code paths use real SDKs. Test doubles must live under `tests/`.
4. **No synchronous long-running operations.** AI/TTS/render/publish always enqueue a job.
5. **No cross-workspace leakage.** Every query scoped to authenticated workspace; cross-tenant access throws 403.
6. **No duplicate publishing.** Publications have unique `idempotencyKey`; reconciliation runs before retry.
7. **No infinite retries.** BullMQ exponential backoff with 5 attempts then dead-letter; fatal provider errors (401/403) not retried.
8. **No silent provider switches.** Failures log, emit notifications, and stop — never fall back to a different provider automatically.

## Production Requirements

Production startup calls `assertRequiredProductionProviders()` and exits if any required credential is missing:

- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- AWS/R2 S3 credentials
- `RESEND_API_KEY`
- `DATABASE_URL`, `REDIS_URL`
- Strong `SESSION_SECRET`, `ENCRYPTION_KEY`, `ARGON2_PEPPER`

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Run API (+ in-process workers) with tsx watch |
| `npm run dev:worker` | Standalone worker |
| `npm run build` | TypeScript compile to `dist/` |
| `npm start` | Run compiled API |
| `npm run db:migrate` | Prisma migrate (dev) |
| `npm run db:deploy` | Apply migrations in prod |
| `npm run db:seed` | Seed dev account |
| `npm run db:studio` | Prisma Studio |
| `npm test` | Run vitest |
| `npm run typecheck` | Type check only |

## Acceptance Test (§83)

The full pipeline requires real credentials configured:

1. Register or log in → 2. Connect a real YouTube channel → 3. Create a strategy →
4. Generate ideas → 5. Pick one → 6. Generate script (real OpenAI) →
7. Generate voiceover (real ElevenLabs) → 8. Generate visuals (real DALL-E) →
9. Render MP4 (real FFmpeg, validated via ffprobe) → 10. Run QC →
11. Approve → 12. Schedule → 13. Publish to YouTube (real upload) →
14. Wait for videoId → 15. Sync analytics → 16. View insights →
17. Observe strategy adjustments for next cycle.

Every step is asynchronous, persisted, resumable, and traceable via `requestId` → `ProviderRequest` → `UsageRecord`.
