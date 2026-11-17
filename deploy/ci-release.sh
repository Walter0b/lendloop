#!/bin/sh
# Runs on the CI runner. Ships the deploy bundle over SSH, then runs deploy/release.sh on the server.
set -eu

: "${DEPLOY_TARGET:?}" "${DEPLOY_PATH:?}" "${IMAGE_REF:?}" "${GHCR_USER:?}" "${GHCR_TOKEN:?}"

remote() {
  ssh -o BatchMode=yes -o StrictHostKeyChecking=yes "$DEPLOY_TARGET" "$@"
}

tar -czf - \
  compose.production.yml Makefile .env.production.example .env.staging.example \
  deploy n8n/setup.sh n8n/workflows scripts/validate-production-env.sh \
  | remote "mkdir -p '$DEPLOY_PATH' && tar -xzf - -C '$DEPLOY_PATH'"

printf '%s' "$GHCR_TOKEN" | remote "docker login ghcr.io -u '$GHCR_USER' --password-stdin" >/dev/null
trap 'remote "docker logout ghcr.io" >/dev/null 2>&1 || true' EXIT

remote "cd '$DEPLOY_PATH' && ./deploy/release.sh '$IMAGE_REF'"
