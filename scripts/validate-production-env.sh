#!/bin/sh
# Refuses to deploy with missing values, placeholders, plain HTTP, weak secrets or floating images.
# Usage: scripts/validate-production-env.sh [.env.production|.env.staging]
set -eu

env_file=${1:-.env.production}
[ -f "$env_file" ] || { echo "Missing $env_file; run make init" >&2; exit 1; }
cd "$(dirname "$env_file")"
env_file=$(basename "$env_file")

value() { sed -n "s/^$1=//p" "$env_file" | tail -n 1; }
required='APP_IMAGE APP_DOMAIN EDGE_NETWORK NEXT_PUBLIC_CONVEX_URL CONVEX_SITE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY CLERK_JWT_ISSUER_DOMAIN
LENDLOOP_WEBHOOK_SECRET POSTGRES_USER POSTGRES_DB N8N_IMAGE POSTGRES_IMAGE REDIS_IMAGE'

for key in $required; do
  current=$(value "$key")
  [ -n "$current" ] || { echo "$key is required in $env_file" >&2; exit 1; }
  case "$current" in
    *example.com*|*replace*|*your-*)
      echo "$key still contains a placeholder in $env_file" >&2
      exit 1
      ;;
  esac
done

case "$(value NEXT_PUBLIC_CONVEX_URL) $(value CONVEX_SITE_URL) $(value CLERK_JWT_ISSUER_DOMAIN)" in
  *http://*) echo "Production service URLs must use HTTPS" >&2; exit 1 ;;
esac

for key in N8N_IMAGE POSTGRES_IMAGE REDIS_IMAGE; do
  case "$(value "$key")" in
    *:latest|*:latest@*) echo "$key must be pinned to a version, not latest" >&2; exit 1 ;;
    *@sha256:*) ;;
    *) echo "warning: $key is not pinned by digest" >&2 ;;
  esac
done

webhook_secret=$(value LENDLOOP_WEBHOOK_SECRET)
[ "${#webhook_secret}" -ge 32 ] || { echo "LENDLOOP_WEBHOOK_SECRET must be at least 32 characters" >&2; exit 1; }

secrets_dir=$(value SECRETS_DIR)
secrets_dir=${secrets_dir:-./secrets}
for secret in "$secrets_dir/postgres_password" "$secrets_dir/n8n_encryption_key"; do
  [ -s "$secret" ] || { echo "Missing $secret; run make init" >&2; exit 1; }
  [ "$(wc -c < "$secret")" -ge 32 ] || { echo "$secret is too short" >&2; exit 1; }
done
