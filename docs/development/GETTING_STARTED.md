# Getting Started (Development)

## Prerequisites
- Node.js ≥ 20.10 (we use NodeNext ESM + top-level await)
- npm ≥ 10 (workspaces)
- Docker + Docker Compose (for local Postgres 16 + Redis 7)
- `ffmpeg` + `ffprobe` v6+ on PATH (required by the rendering provider)

## Quick start

```bash
# 1. One-time bootstrap (installs deps, generates secrets, starts PG/Redis, runs migrations)
bash scripts/setup/init.sh

# 2. Provide provider keys in apps/api/.env (optional in dev, but real providers will fail
#    clearly without them rather than returning fake data — see docs/security/FAIL_FAST.md)

# 3. Run all three processes (recommend 3 terminal tabs or a process manager like overmind)
npm run dev:api       # http://localhost:4000
npm run dev:worker    # BullMQ queue processors (no HTTP port)
npm run dev:web       # http://localhost:5173 (proxies /api to 4000)
```

## Useful scripts
```bash
npm run typecheck             # type-check all workspaces
npm test                      # run unit tests across workspaces
npm run build                 # build api + web
npm run db:studio             # open Prisma Studio against your local DB
npm run db:migrate            # create/apply migrations during dev
npm run db:reset              # reset DB (scripts/database/reset.sh)
```

## Project conventions
- ESM-only across all packages (`"type": "module"`).
- All TypeScript imports between our own modules use explicit `.js` extensions (NodeNext requirement).
- Zod for all env + input validation; never accept raw `req.body` into services.
- Providers (AI / TTS / Storage / Rendering / YouTube / Email) live under `apps/api/src/providers/<domain>/<vendor>/`. Production code contains NO mocks; test-only fakes live in `apps/api/tests/**`.
- BullMQ queues are declared in `src/jobs/queues/index.ts`; processor registration in `src/jobs/processors/index.ts`; payload types in `src/jobs/definitions/jobs.ts`.
- All times UTC. Timezone conversion happens at presentation/scheduling boundaries only.

## Adding a new module
1. Create `apps/api/src/modules/<name>/{<name>.routes.ts, <name>.service.ts, <name>.repository.ts, <name>.schema.ts}`.
2. Export a `register*` function from the routes file that registers Fastify routes under `/api/v1/<name>`.
3. Register the router in `src/app/app.ts` inside the v1 register block.
4. Add job payload types to `src/jobs/definitions/jobs.ts` if your module enqueues work.
5. Re-export provider getters from the relevant `providers/<domain>/index.ts`.
6. Add unit tests under `apps/api/tests/unit/<name>/`, integration tests under `tests/integration/`.
