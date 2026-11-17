#!/bin/sh
# Rolls out one app image and the committed n8n workflows. Rolls the app back if it is unhealthy.
# Usage (on the server, from the deploy directory): deploy/release.sh ghcr.io/owner/lendloop:<sha>
set -eu

image=${1:?image required}
cd "$(dirname "$0")/.."
export ENV_FILE="${ENV_FILE:-.env.production}"
release_file=".release-$(basename "$ENV_FILE")"

compose() { ./deploy/compose.sh "$@"; }

./scripts/validate-production-env.sh "$ENV_FILE"
previous=$(cat "$release_file" 2>/dev/null || true)

echo "Starting data services and n8n"
compose up -d --wait --wait-timeout 180 postgres redis n8n n8n-worker

echo "Backing up n8n before changing workflows"
./deploy/backup.sh

echo "Importing and publishing workflows"
compose run --rm n8n-setup
compose restart n8n n8n-worker
compose up -d --wait --wait-timeout 180 n8n n8n-worker

echo "Deploying $image"
export APP_IMAGE="$image"
compose pull app
if ! compose up -d --wait --wait-timeout 120 app; then
  echo "New app image is unhealthy" >&2
  compose logs --tail=80 app >&2 || true
  if [ -n "$previous" ]; then
    echo "Rolling back to $previous" >&2
    APP_IMAGE="$previous" compose up -d --wait --wait-timeout 120 app
  fi
  exit 1
fi

echo "$image" > "$release_file"
docker image prune -f --filter "until=168h" >/dev/null
./deploy/health.sh
