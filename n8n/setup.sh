#!/bin/sh
set -e
n8n import:workflow --separate --input=/lendloop/workflows
for id in llErrorHandler01 llLoanNotify0001 llOverdueRemind1; do
  n8n publish:workflow --id="$id"
done
echo "LendLoop workflows imported and published. Restart n8n: docker compose restart n8n"
