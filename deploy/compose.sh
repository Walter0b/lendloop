#!/bin/sh
# The one place that knows which files make up the production stack.
# Usage: ENV_FILE=.env.staging deploy/compose.sh ps
set -eu

cd "$(dirname "$0")/.."
env_file=${ENV_FILE:-.env.production}

exec docker compose --env-file "$env_file" \
  -f compose.production.yml -f deploy/compose.data.yml -f deploy/compose.n8n.yml "$@"
