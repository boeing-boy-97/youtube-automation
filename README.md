# ShortForge

Autonomous short-form video production platform.
Node.js + TypeScript monorepo: Fastify API, React/Vite frontend, Prisma + Postgres, Redis + BullMQ.

## Repository Layout

```
shortforge/
├── apps/
│   ├── api/              # Fastify backend (REST API, queues, workers)
│   └── web/              # React + Vite frontend (dashboard, creator studio)
├── packages/
│   ├── shared/           # Shared utilities, constants, error types
│   ├── types/            # Shared TypeScript types (API, content, YouTube, jobs)
│   └── config/           # Shared ESLint / TS / Prettier configs
├── prisma/               # Prisma schema + migrations (shared DB)
├── scripts/              # Setup / DB / dev / maintenance scripts
├── infra/
│   ├── docker/           # Dockerfiles (api, worker)
│   ├── compose/          # docker-compose stacks (dev, prod)
│   ├── monitoring/       # Grafana/Prometheus/Loki configs (TBD)
│   └── deployment/       # Render/Railway/Fly/AWS deployment manifests (TBD)
├── docs/                 # Architecture, API, DB, runbooks, ADRs
└── .github/workflows/    # CI/CD pipelines
```

## Quick Start (local development)

### Prerequisites
- Node.js ≥ 20.10
- npm ≥ 10
- Docker + Docker Compose (for Postgres & Redis)
- ffmpeg / ffprobe installed locally

### 1. Spin up infrastructure
```bash
cd infra/compose
docker compose -f docker-compose.dev.yml up -d postgres redis
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Copy `.env.example` to `apps/api/.env` and fill in required provider keys:
- `DATABASE_URL` (postgres)
- `REDIS_URL` (redis)
- `SESSION_SECRET`, `ENCRYPTION_KEY`, `ARGON2_PEPPER` (base64, 32 bytes each)
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `YOUTUBE_API_KEY` (for YouTube OAuth/upload)
- `RESEND_API_KEY` (email)

In production, failure to set a required provider causes the server to refuse startup rather than silently using mocks.

### 4. Initialize the database
```bash
npm run db:generate
npm run db:migrate
npm run db:seed      # optional — seeds demo workspace/admin user
```

### 5. Run dev servers
```bash
# Terminal 1 — API server
npm run dev:api      # http://localhost:4000

# Terminal 2 — Worker (BullMQ queue processors)
npm run dev:worker

# Terminal 3 — Frontend
npm run dev:web      # http://localhost:5173
```

## Testing & Typechecking
```bash
npm run typecheck
npm test
npm run build        # builds all workspaces
```

## Production
- Docker images: `infra/docker/Dockerfile.api`, `infra/docker/Dockerfile.worker`
- Build from repo root: `docker build -f infra/docker/Dockerfile.api -t shortforge-api .`
- All providers are real implementations (OpenAI, ElevenLabs, AWS S3/R2, FFmpeg, Resend, googleapis). There are NO mocks in `src/`. Missing credentials fail fast.

See `docs/` for architecture, API reference, operational runbooks, and security notes.
