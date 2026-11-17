# n8n workflows

Sources live in `n8n/src` (one file per workflow, Code node scripts in `n8n/src/code`).
`npm run n8n:build` writes the importable JSON to `n8n/workflows/`. Workflow ids are fixed
so the `errorWorkflow` links survive `n8n import:workflow`.

## 1. LendLoop: loan notifications
`Webhook → Verify signature → valid? → Accept (202) → Notify recipient → Sign → POST /automation/notifications`
- Invalid or stale signatures get a 401 and nothing else runs.
- n8n answers 202 right after verification, so Convex only waits for acceptance and
  never retries because a slow email provider timed out.
- The notify step retries 3 times. If it still fails, its error output writes
  `status: failed` back to Convex, so the loan shows "Notification failed".

## 2. LendLoop: overdue reminders
`Daily 08:00 (or "Run now") → Sign query → POST /automation/overdue-loans → one item per loan → Send reminder → Sign → POST /automation/reminders`
- Convex decides what is overdue (`approved` and `endDate < today`) and skips loans that
  already have today's reminder, so a manual rerun the same day sends nothing twice.
- Each loan has a `reminderKey` = `<loanId>:<date>`. The write-back is keyed by it.
- A failed reminder is recorded as `failed` and retried by the next daily run.

## 3. LendLoop: error handler
`Error Trigger → Build failure report → Sign → POST /automation/failures`.
Both workflows above name it as their error workflow. Failures show on the admin page
under "Automation health", next to deliveries Convex gave up on.

## Reliability summary
| Failure | What happens |
|---|---|
| n8n down, 5xx, 404 (webhook not registered yet) | Convex retries 30s, 1m, 2m, 4m, then marks the event `failed` (admin page) |
| Bad config (other 4xx, missing env) | No retry; marked `failed` with the reason |
| Convex down during write-back | HTTP node retries 3 times, then the error workflow reports it |
| n8n crashes after answering 202 | The error workflow never runs, so a Convex cron (`automation/watchdog.ts`, every 15 min) marks events with no write-back after 15 min as `failed` |
| n8n retries a write-back | Idempotent: keyed by `eventId`, `reminderKey` or execution id |
| Duplicate event delivery | Write-back is a no-op; at most one extra mock message (at-least-once) |

Write-back keys: `outbox.eventId`, `reminders.key`, `failures.key` and `activity.key`
are all checked before insert, inside one Convex transaction, so two concurrent retries
cannot both insert (Convex mutations are serialisable).
