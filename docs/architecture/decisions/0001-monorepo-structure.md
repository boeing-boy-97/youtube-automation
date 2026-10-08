# ADR-0001: Monorepo Structure

## Status
Accepted

## Context
ShortForge is a single product (web app + API + async workers) with tightly coupled
domain types, shared enums, and coordinated releases. Splitting into multiple repos
would create friction for cross-cutting changes (e.g., a new content state flowing
from the scheduler → API → frontend → analytics).

## Decision
Adopt an npm-workspaces monorepo with the following top-level layout:

- `apps/api`  — Fastify backend (HTTP API, BullMQ workers, domain modules)
- `apps/web`  — React + Vite frontend
- `packages/shared` — shared utilities, constants, error classes
- `packages/types`  — shared TypeScript types
- `packages/config` — shared lint/format/ts configs
- `prisma/`   — single Prisma schema (source of truth; both apps share one DB)
- `scripts/`  — one-shot scripts (seed, migrations, maintenance)
- `infra/`    — Dockerfiles, compose stacks, monitoring, deployment manifests
- `docs/`     — architecture, ADRs, API reference, runbooks
- `.github/workflows/` — CI/CD

Initially a modular monolith (not microservices). All backend code lives in `apps/api`
but is organized into clear bounded-context modules under `src/modules/*`, each with
route → controller → service → repository → provider boundaries.

## Consequences
- **Positive**: Single PR can touch API + frontend + types atomically. Shared types
  package eliminates drift. Single Prisma schema keeps migrations coherent.
- **Negative**: CI must build multiple workspaces; larger checkout. Requires
  discipline around package boundaries (no cross-package runtime imports except
  via `packages/*` public entrypoints).
- **Future**: If/when a module must be independently scalable (e.g., the render
  farm), it can be extracted into a new app inside the monorepo first, then to a
  separate service without rewriting import paths.
