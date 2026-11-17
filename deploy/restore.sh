#!/bin/sh
# Restores an n8n PostgreSQL dump made by deploy/backup.sh. Replaces the current n8n data.
# The secrets/n8n_encryption_key in place must be the one that was live when the dump was made.
# Usage: deploy/restore.sh backups/n8n-YYYYmmdd-HHMMSS.dump
set -eu

cd "$(dirname "$0")/.."
dump=${1:?Usage: deploy/restore.sh <dump file>}
[ -s "$dump" ] || { echo "$dump is missing or empty" >&2; exit 1; }

compose() { ./deploy/compose.sh "$@"; }

compose exec -T postgres pg_restore --list < "$dump" > /dev/null || {
  echo "$dump is not a valid pg_dump custom-format archive" >&2
  exit 1
}

if [ "${CONFIRM:-}" != yes ]; then
  printf 'This replaces all n8n data with %s. Type "yes" to continue: ' "$dump"
  read -r answer
  [ "$answer" = yes ] || { echo "Aborted"; exit 1; }
fi

echo "Stopping n8n so nothing writes during the restore"
compose stop n8n n8n-worker

# shellcheck disable=SC2016 # expands inside the container
compose exec -T postgres \
  sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --single-transaction' \
  < "$dump"

echo "Starting n8n"
compose up -d --wait --wait-timeout 180 n8n n8n-worker
echo "Restore complete"
