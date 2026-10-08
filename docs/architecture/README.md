# Architecture Overview

ShortForge is a **modular monolith**: a single deployable API process plus a co-located BullMQ worker process, sharing one Prisma schema, one Postgres database, and one Redis cluster. The frontend is a separate Vite/React app that talks to the API over HTTP + SSE.

## High-level diagram

```
┌────────────┐        HTTPS/SSE         ┌──────────────────────────────┐
│  Browser   │ ───────────────────────▶ │  Fastify API (apps/api)      │
│ (React UI) │ ◀─────────────────────── │   /api/v1/* + SSE /jobs/*     │
└────────────┘                          │   Zod validation + RBAC      │
                                        └──────────────┬───────────────┘
                                                       │
                               ┌───────────────────────┼────────────────────────┐
                               │                       │                        │
                        ┌──────▼──────┐         ┌──────▼──────┐         ┌───────▼──────┐
                        │  PostgreSQL │         │    Redis    │         │  Providers   │
                        │  (Prisma)   │         │  queues/    │         │ OpenAI/11L/  │
                        │  source of  │         │  locks/     │         │ S3/FFmpeg/   │
                        │  truth      │         │  cache      │         │ Resend/Google│
                        └──────┬──────┘         └──────┬──────┘         └───────┬──────┘
                               │                       │                        │
                        ┌──────▼───────────────────────▼────────────────────────▼──────┐
                        │                  BullMQ worker process                       │
                        │  script-gen → voice-gen → visuals → render → QC → publish →  │
                        │  analytics-sync → reconciliation → automation                │
                        └──────────────────────────────────────────────────────────────┘
```

## Guiding principles
1. **Modular monolith, not microservices (yet).** Clear bounded contexts under `src/modules/*` keep future extraction cheap, but we deploy one artifact today.
2. **Postgres is source of truth.** Redis is cache + queues + locks only; never authoritative.
3. **Outbox pattern for DB + queue consistency.** We never mark a content item as e.g. `RENDERING` unless the render job has been durably enqueued via the outbox.
4. **Real providers only.** No mock/demo/simulated providers in `src/`. Missing credentials fail fast at startup.
5. **Idempotency everywhere.** Dangerous mutations require idempotency keys; webhooks/OAuth callbacks/scheduled jobs are deduped via `IdempotencyKey` table.
6. **Distributed locking** via Redlock for publish/automation/token-refresh/scheduled execution.
7. **Strict state machine.** Content can only transition via the transitions declared in `src/common/utils/state-machine.ts`; invalid transitions throw `InvalidStateTransitionError`.
8. **UTC everywhere.** Timezone conversion happens at the edge (presentation/scheduling inputs).
9. **Cursor-based pagination only.** No unbounded collections.
10. **FFmpeg/ffprobe validates actual media** before marking content `RENDERED` (magic bytes, codecs, resolution checks).
11. **Publishing is idempotent.** Reconciliation worker heals any split-brain between YouTube upload and DB state; we never blindly re-upload.
12. **Zero stack traces or secrets to clients.** All errors return a fixed `{ error: { code, message, requestId } }` envelope.

See `docs/architecture/decisions/` for ADRs, and `docs/api/` for endpoint reference.
