# Production follow-up work

Docker images, Compose stack, PostgreSQL, Redis queue worker, health checks, Docker secret
files, pinned images, pruning, backup and restore, staging env, CI/CD with rollback are done.
See [deployment.md](deployment.md). What remains before real neighbours use it:

**Infrastructure**
- Move HMAC Code nodes to an isolated signer or n8n external secrets, then switch to external
  task runners and turn off `$env` access in workflows (see security.md).
- Schedule `make backup` and ship dumps off the host, encrypted, with a restore drill.
- Keep secrets in a manager (Doppler, 1Password, Vault) and push them to Convex from CI.
- Rotate `LENDLOOP_WEBHOOK_SECRET` with a key id: accept `v1` signatures from the old and
  new key for a short overlap. Use separate secrets per direction.

**Reliability**
- Real channels (email through Postmark or SES, or Slack) using n8n credentials, with
  per-user notification preferences and an unsubscribe link.
- An n8n "Remove Duplicates" step (keyed by `eventId`) to make notifications effectively
  exactly-once, not only the write-backs.
- An alert (Slack or PagerDuty) from the error workflow and the watchdog cron, instead of
  only the admin panel, plus a "resend" button for failed notifications.
- Store each user's time zone. Loan days are UTC today (requests accept the borrower's
  local "today"); overdue should flip at the borrower's midnight, not UTC midnight.
- Paginate board and loan queries (`.paginate`) and denormalise availability onto the tool
  once a neighbourhood grows past a few hundred listings.

**Security and privacy**
- Rate limit request creation per user (`@convex-dev/rate-limiter`) and add abuse
  reporting on listings.
- Sync roles from Clerk organisations if several neighbourhoods share one deployment, with
  neighbourhood id on every table and checked in the same custom function builders.
- An audit log for admin actions (removals, trust changes), and data export and deletion
  for users (sync from Clerk `user.deleted` webhooks).
- A Content Security Policy tuned for Clerk and Convex, plus end-to-end tests (Playwright)
  for each role.
