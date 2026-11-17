#!/bin/sh
# Usage: deploy/smoke-test.sh lendloop.joram.app
set -eu

domain=${1:?domain required}

echo "App answers on https://$domain/"
curl -fsS --retry 6 --retry-delay 5 --retry-all-errors -o /dev/null "https://$domain/api/health"
curl -fsS --retry 3 --retry-delay 5 --retry-all-errors -o /dev/null "https://$domain/"

echo "Webhook is routed to n8n and rejects unsigned calls"
# n8n registers webhooks a few seconds after a restart, so a 404 right after release is retried
for attempt in 1 2 3 4 5 6; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    -H 'content-type: application/json' -d '{"payload":"{}"}' \
    "https://$domain/webhook/lendloop/loan-event")
  [ "$code" = 404 ] || break
  echo "Webhook not registered yet (attempt $attempt), retrying"
  sleep 5
done
[ "$code" = 401 ] || { echo "Expected 401 from the webhook, got $code" >&2; exit 1; }

echo "n8n editor is not public"
code=$(curl -s -o /dev/null -w '%{http_code}' "https://$domain/rest/settings")
[ "$code" != 200 ] || { echo "n8n REST API is reachable through the proxy" >&2; exit 1; }

echo "Smoke test passed"
