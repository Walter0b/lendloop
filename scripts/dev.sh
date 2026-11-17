#!/bin/sh
# make dev: Convex watcher + Next.js on :3000, both native. N8N=1 also starts n8n in Docker.
set -eu
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env && chmod 600 .env
  echo "Created .env from .env.example. Add your dev Clerk keys, then run: make dev"
  exit 1
fi

# .env is the dev file. Production keys here mean it was overwritten by .env.production.
if grep -qE '^(APP_DOMAIN|POSTGRES_USER|SECRETS_DIR)=' .env; then
  echo "Refusing to start: .env contains production settings (APP_DOMAIN, POSTGRES_*, ...)."
  echo "Restore a dev .env from .env.example so the local app does not use production Convex or Clerk."
  exit 1
fi

# The first convex dev run asks questions, which cannot happen in the background.
if ! cat .env .env.local 2>/dev/null | grep -q '^CONVEX_DEPLOYMENT='; then
  echo "No Convex deployment configured yet. Run once: npx convex dev (answer the prompts, then Ctrl+C)"
  exit 1
fi

if [ "${N8N:-0}" = 1 ]; then
  docker compose up -d n8n
  echo "n8n on http://localhost:5678 (stop with: docker compose stop n8n)"
fi

npx convex dev &
convex_pid=$!
trap 'kill "$convex_pid" 2>/dev/null || true' EXIT INT TERM

npm run dev
