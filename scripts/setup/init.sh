#!/usr/bin/env bash
# scripts/setup/init.sh — one-shot local environment bootstrap.
# Idempotent: safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/../.."

if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  echo "Node.js >= 20 is required. Install from https://nodejs.org/ or use nvm." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for Postgres/Redis. Install Docker Desktop." >&2
  exit 1
fi

echo "▸ Installing npm dependencies..."
npm install

if [ ! -f apps/api/.env ]; then
  echo "▸ Creating apps/api/.env from .env.example..."
  cp .env.example apps/api/.env
  # Generate random secrets
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
  ENC=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  PEPPER=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
  # OSX vs GNU sed
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/replace-me-with-32-bytes-of-csprng/$SECRET/" apps/api/.env
    sed -i '' "s/replace-me-with-32-bytes-base64/$ENC/" apps/api/.env
    sed -i '' "s/replace-me-with-32-bytes-base64/$PEPPER/" apps/api/.env
  else
    sed -i "s/replace-me-with-32-bytes-of-csprng/$SECRET/" apps/api/.env
    sed -i "s/replace-me-with-32-bytes-base64/$ENC/" apps/api/.env
    sed -i "0,/replace-me-with-32-bytes-base64/s//$PEPPER/" apps/api/.env
  fi
fi

echo "▸ Starting Postgres & Redis..."
(cd infra/compose && docker compose -f docker-compose.dev.yml up -d postgres redis)

echo "▸ Waiting for Postgres..."
sleep 3
for i in $(seq 1 20); do
  if docker exec shortforge-postgres pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done

echo "▸ Generating Prisma client..."
npm run db:generate -w @shortforge/api

echo "▸ Running migrations..."
npm run db:deploy -w @shortforge/api || npm run db:migrate -w @shortforge/api

echo ""
echo "✓ Setup complete. Next steps:"
echo "   1. Edit apps/api/.env and add OPENAI_API_KEY / ELEVENLABS_API_KEY / GOOGLE_* / RESEND_API_KEY as needed."
echo "   2. Run  npm run dev:api     in one terminal   (http://localhost:4000)"
echo "   3. Run  npm run dev:worker  in another terminal"
echo "   4. Run  npm run dev:web     in a third         (http://localhost:5173)"
