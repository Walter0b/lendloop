#!/bin/sh
# Dumps the n8n PostgreSQL database (workflows, credentials, execution history).
# Credentials in the dump are encrypted with secrets/n8n_encryption_key: back that file up
# separately, or the dump cannot be used to restore credentials.
# Usage: deploy/backup.sh [keep_days]   (default 14)
set -eu

cd "$(dirname "$0")/.."
keep_days=${1:-14}
backup_dir=${BACKUP_DIR:-backups}
stamp=$(date +%Y%m%d-%H%M%S)
target="$backup_dir/n8n-$stamp.dump"

umask 077
mkdir -p "$backup_dir"

# Custom format: compressed, and restorable table by table with pg_restore
# shellcheck disable=SC2016 # expands inside the container
./deploy/compose.sh exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner' > "$target.partial"

# Refuse to keep an empty or truncated dump
./deploy/compose.sh exec -T postgres pg_restore --list < "$target.partial" > /dev/null
mv "$target.partial" "$target"
echo "Wrote $target ($(wc -c < "$target" | tr -d ' ') bytes)"

find "$backup_dir" -name 'n8n-*.dump' -type f -mtime +"$keep_days" -print -delete
