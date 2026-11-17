#!/bin/sh
set -eu

env_file=${1:-.env.production}
script_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
project_dir=$(dirname "$script_dir")
"$script_dir/validate-production-env.sh" "$env_file"

[ -n "${CONVEX_DEPLOY_KEY:-}" ] || {
  echo "Export the production CONVEX_DEPLOY_KEY before deploying" >&2
  exit 1
}

value() { sed -n "s/^$1=//p" "$env_file" | tail -n 1; }
issuer=$(value CLERK_JWT_ISSUER_DOMAIN)
webhook_secret=$(value LENDLOOP_WEBHOOK_SECRET)
n8n_url="https://$(value APP_DOMAIN)/webhook/lendloop/loan-event"

cd "$project_dir"
npx convex env set CLERK_JWT_ISSUER_DOMAIN "$issuer"
npx convex env set LENDLOOP_WEBHOOK_SECRET "$webhook_secret"
npx convex env set N8N_NOTIFY_WEBHOOK_URL "$n8n_url"
echo "Convex production environment configured"
