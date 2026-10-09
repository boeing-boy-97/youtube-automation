# ShortForge Deployment Guide

This guide details exactly which folders to deploy, what commands to run, and which environment variables to configure for both **Frontend** and **Backend**.

---

## At a Glance

| Service | Monorepo Folder | Deployment Type | Recommended Hosts |
|---|---|---|---|
| **Frontend UI** | `apps/web` | Static SPA (Vite + React) | Vercel, Netlify, Cloudflare Pages |
| **Backend API** | `apps/api` (Root context `.`) | Node.js / Docker Web Service | Railway, Render, Fly.io, AWS |
| **Worker (Queues)**| `apps/api` (Root context `.`) | Background Worker (BullMQ) | Railway, Render, Fly.io, AWS |
| **Database** | `prisma/schema.prisma` | PostgreSQL 16+ | Neon, Supabase, AWS RDS, Render PG |
| **Cache & Locks** | Redis 7+ | Managed Redis | Upstash, Redis Cloud, Render Redis |

---

## 1. Deploying the Frontend (`apps/web`)

### Option A: Vercel (Recommended)
1. Import your GitHub repository to **Vercel**.
2. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web` *(Click "Edit" and choose `apps/web`)*
   - **Build Command**: `npm run build` *(or leave default `vite build`)*
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-api-domain.com/api/v1`
4. Deploy!
   *(SPA routing is handled automatically via `apps/web/vercel.json`)*.

### Option B: Netlify
1. Connect your GitHub repository to **Netlify**.
2. In **Build Settings**:
   - **Base directory**: `apps/web`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. SPA redirects are automatically applied via `apps/web/public/_redirects`.
4. Add environment variable `VITE_API_BASE_URL`.

### Option C: Cloudflare Pages
- **Root directory**: `apps/web`
- **Build command**: `npm run build`
- **Output directory**: `dist`
- Cloudflare will pick up `apps/web/public/_redirects` automatically.

---

## 2. Deploying the Backend API (`apps/api`)

Because ShortForge uses a monorepo where `@shortforge/api` references root `prisma/schema.prisma` and `packages/*`, the build context is the **repository root (`.`)**.

### Option A: Docker Deployment (Render, Railway, Fly.io, AWS ECS)
Use the included multi-stage Dockerfile:
- **Build Context**: `.` (Repository root)
- **Dockerfile Path**: `infra/docker/Dockerfile.api`
- **Exposed Port**: `4000` (Fastify automatically honors the `$PORT` environment variable injected by Render/Railway/Fly)
- **Health Check Endpoint**: `/health/ready` (or `/health/live`)

#### Running the BullMQ Background Worker
ShortForge requires a background worker process for asynchronous video rendering, TTS generation, and YouTube publishing.
- **Build Context**: `.` (Repository root)
- **Dockerfile Path**: `infra/docker/Dockerfile.worker`
- No public HTTP port needed.

### Option B: Native Node.js Deployment (Railway / Render / Heroku)
If deploying without Docker:
- **Root Directory**: `.` (Repository root)
- **Build Command**:
  ```bash
  npm ci && npm run db:generate -w @shortforge/api && npm run build -w @shortforge/api
  ```
- **Pre-deploy Migration Command**:
  ```bash
  npm run db:deploy -w @shortforge/api
  ```
- **Start Command (API)**:
  ```bash
  npm run start:api
  ```
- **Start Command (Worker)**:
  ```bash
  npm run start:worker
  ```

---

## 3. Required Backend Environment Variables

Configure these in your backend hosting provider:

```bash
# Core
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Database & Redis (Required)
DATABASE_URL=postgresql://user:password@host:5432/shortforge?schema=public
REDIS_URL=redis://default:password@host:6379

# Cryptography & Auth Secrets (Generate 32 random bytes, base64)
SESSION_SECRET=generate-random-32-bytes-base64url
ENCRYPTION_KEY=generate-random-32-bytes-base64
ARGON2_PEPPER=generate-random-32-bytes-base64

# Storage Provider (s3 or local)
STORAGE_PROVIDER=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-aws-access-key
S3_SECRET_ACCESS_KEY=your-aws-secret-key
# (Optional for Cloudflare R2 / MinIO)
# S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# AI & Media Providers
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-frontend-domain.vercel.app/youtube/callback
YOUTUBE_API_KEY=...
RESEND_API_KEY=re_...
```

---

## 4. One-Click Stacks

- **Local Dev**: Run `docker compose -f infra/compose/docker-compose.dev.yml up`
- **Render.com**: Connect the repository and Render will automatically detect `infra/deployment/render.yaml` to spin up PostgreSQL, Redis, API, Worker, and Frontend together.
