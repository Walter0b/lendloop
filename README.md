# LendLoop

**Borrow what you need. Lend what you don't.**

A neighbourhood tool-lending board. Neighbours list tools, ask to borrow them for a date range,
approve or decline requests on their own tools and mark loans as returned. n8n handles the
automated part: a notification for every request change and a daily overdue reminder, with
the outcome written back to each loan ("Reminder sent 2 days ago").

Stack: Next.js 16 (App Router), Clerk, Convex, n8n 2.x, TypeScript.

## Contents
1. [Local setup](#local-setup)
2. [Environment variables](#environment-variables)
3. [Architecture](#architecture)
4. [n8n workflows and reliability](#n8n-workflows-and-reliability)
5. [Security decisions](#security-decisions)
6. [Data minimisation](#data-minimisation)
7. [What I would change for production](#what-i-would-change-for-production)
8. [Tests and checks](#tests-and-checks)

Each section is a summary. The `docs/` folder has the full version.

## Local setup
Prerequisites: Node 20+, Docker, a free Clerk account, and either a free Convex account or
the self-hosted Convex container in `docker-compose.yml`.

```bash
npm install
cp .env.example .env                # the one dev env file: Clerk keys and n8n secrets

# Convex
npx convex dev                            # terminal 1: pushes functions, writes .env
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-app>.clerk.accounts.dev
npx convex env set LENDLOOP_WEBHOOK_SECRET "$(openssl rand -hex 32)"   # same value in .env
npx convex env set N8N_NOTIFY_WEBHOOK_URL https://<public-n8n>/webhook/lendloop/loan-event

# Next.js
npm run dev                               # terminal 2: http://localhost:3000

# n8n
docker compose run --rm n8n-setup         # imports and publishes the three workflows
docker compose up -d n8n                  # http://localhost:5678
```

1. In Clerk, enable the Convex integration (it creates the `convex` JWT template).
2. Sign in once at http://localhost:3000, then make yourself admin. This is an internal
   function, so only someone with deployment access can run it:
   `npx convex run identity/admin:setRole '{"email":"you@example.com","role":"admin"}'`
3. Convex Cloud cannot reach `localhost:5678`. Either expose n8n with
   `docker compose --profile tunnel up -d tunnel` (URL in `docker compose logs tunnel`),
   or run everything locally with `docker compose --profile convex up -d convex` and use
   `http://n8n:5678/...` and `http://convex:3211` as the URLs.
4. Optional demo data with one overdue loan: `npx convex run dev/seed:demo`.

**Try the automations**
- Mock notifications are printed in `docker compose logs -f n8n` (`[LendLoop notify]`).
- `LENDLOOP_WEBHOOK_SECRET=... node scripts/send-test-event.mjs` sends a signed event as
  Convex would. Add `--bad-signature` to see the 401.
- Run "LendLoop: overdue reminders" from the n8n UI instead of waiting for 08:00.
- Any user whose email ends in `@fail.test` makes the mock channel fail, to exercise the
  failure path. The loan then shows "Notification failed".

After the first setup, `make dev` starts the Convex watcher and Next.js together (Ctrl+C stops
both). `make dev N8N=1` also starts n8n in Docker.

Full steps: [docs/setup.md](docs/setup.md).

## Environment variables
No secret is in the code or in the exported workflow JSON. `n8n/build.mjs` refuses to write
a workflow file that looks like it contains one.

| Where | Name | Purpose |
|---|---|---|
| `.env` | `NEXT_PUBLIC_CONVEX_URL` | Convex client URL (written by `npx convex dev`) |
| `.env` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `.env` | `CLERK_SECRET_KEY` | Clerk server key, used by `src/proxy.ts` |
| Convex env | `CLERK_JWT_ISSUER_DOMAIN` | Issuer Convex trusts for Clerk JWTs |
| Convex env | `LENDLOOP_WEBHOOK_SECRET` | Shared HMAC secret, both directions |
| Convex env | `N8N_NOTIFY_WEBHOOK_URL` | URL of the "loan notifications" webhook |
| `.env` | `N8N_ENCRYPTION_KEY` | Encrypts n8n credentials at rest |
| `.env` | `LENDLOOP_WEBHOOK_SECRET` | Same value as in Convex |
| `.env` | `CONVEX_SITE_URL` | Convex HTTP actions URL (`https://<name>.convex.site`) |
| `.env` | `WEBHOOK_URL` | Public base URL n8n uses for webhooks |

If the n8n variables are missing in Convex, deliveries fail with a clear reason on the admin
page. They are never skipped silently. Details: [docs/environment.md](docs/environment.md).

## Architecture
```
Browser (Next.js + Clerk) ──JWT──▶ Convex queries/mutations ──outbox──▶ deliver action
                                        ▲                                 │ HMAC POST
                                        │ HMAC POST write-backs           ▼
                                   Convex HTTP routes ◀──────────── n8n workflows
```

- **Four bounded contexts** in `convex/`: identity (users, roles, Trusted Lender), catalog
  (listings), lending (loans) and automation (outbox, activity, reminders, failures).
  Each has a `domain/` folder of pure, unit-tested rules and thin Convex functions that
  load data, call the rules and save. `src/features/` mirrors the same split.
- **One state machine for loans**: `requested → approved → returned`, with `declined` and
  `cancelled` as exits. `lending/service.ts#moveLoan` is the only place a status changes,
  and it always publishes an event, so no change can skip its notification.
- **Transactional outbox**: the mutation that changes a loan also inserts the outbox row and
  schedules delivery, in the same transaction. Either both happen or neither does.
- **The UI never decides permissions**: loan queries return the `actions` the viewer may
  take, computed by the same policy the mutations enforce. The UI renders those buttons.

Details and the loan lifecycle diagram: [docs/architecture.md](docs/architecture.md).

## n8n workflows and reliability
Exported JSON is in `n8n/workflows/`, built from readable sources in `n8n/src` with
`npm run n8n:build`.

| Workflow | Flow |
|---|---|
| Loan notifications | Webhook → verify HMAC → 202 → notify the right party → signed write-back |
| Overdue reminders | Daily 08:00 → signed query to Convex → remind each borrower → signed write-back |
| Error handler | Error Trigger → signed failure report to Convex (admin "Automation health") |

| Failure | What happens |
|---|---|
| n8n down, 5xx, 404 | Convex retries after 30s, 1m, 2m and 4m, then marks the event `failed` on the admin page |
| Notify or reminder step fails | n8n retries 3 times, then writes `failed` back, so it shows on the loan |
| Convex down during a write-back | HTTP node retries 3 times, then the error workflow reports it |
| n8n crashes after answering 202 | A Convex cron flags events with no write-back after 15 minutes as `failed` |
| n8n retries a write-back | Idempotent: keyed by `eventId`, `reminderKey` (loan + day) or execution id |
| Overdue workflow run twice in a day | Convex skips loans that already had today's reminder |

Details: [docs/automation.md](docs/automation.md).

## Security decisions
- **Roles live in Convex**, not in Clerk metadata or anything the client sends. New users are
  always `user`. The first admin is set with an internal function.
- **Authorization is enforced in Convex.** Every public function is built with `userQuery`,
  `userMutation`, `adminQuery` or `adminMutation`, so the check cannot be forgotten.
  Ownership is checked against the record loaded from the database, never a client id.
  `src/proxy.ts` only keeps anonymous visitors out of private pages.
- **Admins moderate, they do not impersonate.** They remove any listing (open loans are
  cancelled and borrowers notified), see all loans and set Trusted Lender. They cannot
  approve or return other people's loans.
- **HMAC-SHA256 in both directions** over `timestamp.payload`, with a 5 minute replay window
  and a constant-time comparison. The payload is sent as a JSON string, so both sides sign
  the exact same bytes. Each Convex route checks the payload `type`, so a signed message
  cannot be replayed against another endpoint.
- **Errors leak nothing**: endpoints return a code (`bad_signature`, `rejected`) and the
  details stay in the logs.
- **Known trade-off**: n8n Code nodes read the HMAC secret through `$env`, which exposes the
  n8n environment to workflow editors. Why I accepted it and how I would remove it:
  [docs/security.md](docs/security.md).

## Data minimisation
- **Public page**: tool name and category only. The projection is done in the Convex
  query, so the browser never receives the rest.
- **Signed-in neighbours** see first names only. Emails are visible to admins only.
- **To n8n, notifications**: recipient first name, email and role, tool name, dates and the
  counterpart's first name. No user ids, notes, descriptions or the counterpart's email.
- **To n8n, overdue feed**: loan id, reminder key, borrower first name and email, tool name
  and end date.
- **Payloads are built at send time** from current data, so a changed email is respected.
- **n8n keeps error executions**. Successful ones can be pruned.

## What I would change for production
- **Deployment is implemented:** a standalone Next.js image behind the edge nginx (TLS),
  n8n on PostgreSQL with a Redis queue worker, Docker secret files, pinned images, health
  checks, pruning, bounded logs, backup and restore, staging, and CI/CD with rollback. Run
  `make help`, and see [docs/deployment.md](docs/deployment.md).
- Move HMAC Code nodes to an isolated signer, then switch n8n to external task runners and
  remove workflow access to `$env` before allowing untrusted workflow editors.
- **Separate secrets per direction**, rotated with a key id and a short overlap.
- **Real channels** (email through Postmark or SES, or Slack) as n8n credentials, with
  per-user preferences and unsubscribe. Add a dedupe step on `eventId` so notifications
  are effectively sent once, not only written back once.
- **Alerting** (Slack or PagerDuty) from the error workflow and the watchdog cron, plus a
  "resend" button for failed notifications.
- **Per-user time zones.** Loan days are UTC today: requests accept the borrower's local
  "today", but overdue starts at UTC midnight.
- **Rate limits** on requests, abuse reports on listings, an audit log of admin actions,
  user data export and deletion (Clerk `user.deleted` webhook), a CSP, and Playwright
  tests per role.
- **Pagination** and availability stored on the tool once a neighbourhood has more than a
  few hundred listings.

Full list: [docs/production.md](docs/production.md).

## Tests and checks
```bash
npm test            # domain rules, HMAC, retry policy, and Convex functions run as real users
npm run typecheck
npm run lint:size   # every hand-written file except this README is at most 50 lines
```
`tests/convex/` uses convex-test to call the real functions as different users. It checks
that strangers get `FORBIDDEN`, anonymous visitors only see name and category, admin
removal cancels loans, write-backs are idempotent, and the watchdog flags silent runs.
