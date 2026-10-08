#!/usr/bin/env bash
# scripts/database/reset.sh — local DB reset: drop, migrate, seed.
set -euo pipefail
cd "$(dirname "$0")/../.."
echo "▸ Resetting local database..."
(cd infra/compose && docker compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS shortforge;" -c "CREATE DATABASE shortforge;")
npm run db:deploy -w @shortforge/api
npm run db:seed -w @shortforge/api || true
echo "✓ Reset complete."
