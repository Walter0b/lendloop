#!/bin/sh
# Exits non-zero unless every long-running service reports healthy.
# Usage: deploy/health.sh            (ENV_FILE selects the stack, default .env.production)
set -eu

cd "$(dirname "$0")/.."
status=0

for service in app postgres redis n8n n8n-worker; do
  ids=$(./deploy/compose.sh ps -q "$service")
  if [ -z "$ids" ]; then
    printf '%-11s %s\n' "$service" "not running"
    status=1
    continue
  fi
  for id in $ids; do
    health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$id")
    printf '%-11s %s\n' "$service" "$health"
    [ "$health" = healthy ] || status=1
  done
done

# The app's own liveness route, from inside its container
if ./deploy/compose.sh exec -T app node -e \
  "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
  echo "app /api/health ok"
else
  echo "app /api/health failed"
  status=1
fi

exit "$status"
