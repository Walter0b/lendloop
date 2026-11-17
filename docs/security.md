# Security and data minimisation

## Authentication and roles
- Clerk signs users in; Convex verifies the Clerk JWT on every call (`convex/auth.config.ts`).
- Roles (`admin`, `user`) and the Trusted Lender flag live in the Convex `users` table, not in
  Clerk metadata the browser can see or in anything the client sends. New users are always `user`.
- The first admin is granted with an **internal** mutation (`identity/admin:setRole`), which
  cannot be called from a browser.
- `src/proxy.ts` only keeps anonymous visitors out of private pages. It is not the security
  boundary.

## Authorization enforced in Convex
- Every public function is built with `userQuery`, `userMutation`, `adminQuery` or
  `adminMutation` (`convex/shared/functions.ts`). There is no way to forget the check.
- Ownership and party checks are pure functions (`catalog/domain/policy.ts`,
  `lending/domain/policy.ts`), unit tested, and applied inside each mutation after loading
  the record from the database. Ids sent by the client are never trusted for ownership.
- The lender id is copied onto the loan at creation, so authorization never depends on a
  tool that might later change.
- Admins can remove any listing, see all loans and set Trusted Lender. Removing a listing
  that is lent out cancels the loan and notifies the borrower. They cannot approve or
  return other people's loans: moderation is not impersonation.
- `tests/convex/*` run the real Convex functions (convex-test) as different users and
  assert the `FORBIDDEN` / `UNAUTHENTICATED` / `CONFLICT` paths, not only the pure rules.

## Integration security
- HMAC-SHA256 in both directions over `${timestamp}.${payload}`, sent as
  `x-lendloop-signature: v1=<hex>` with `x-lendloop-timestamp`.
- The payload travels as a JSON **string** inside `{ "payload": "..." }`, so both sides sign
  and verify the exact same bytes regardless of JSON re-serialisation.
- Timestamps older than 5 minutes are rejected (replay window). Comparison is constant time.
- Each Convex endpoint checks the payload `type` matches the route, so a signed reminder
  cannot be replayed against the failure endpoint. Replays inside the window are harmless
  because every write-back is idempotent.
- Endpoints return error codes only (`bad_signature`, `rejected`); details go to Convex logs.

## Known trade-off: n8n environment access
The Code nodes read `LENDLOOP_WEBHOOK_SECRET` through `$env`, which needs
`N8N_BLOCK_ENV_ACCESS_IN_NODE=false`. That lets any workflow editor read every variable
in the n8n environment. I accepted it locally because n8n has no credential type a Code
node can use for HMAC, and `docker-compose.yml` passes n8n only its four variables from
`.env` (no Clerk or Convex admin keys). Workflow editors are trusted anyway. The production fix is in production.md.

## Data minimisation
- Public landing page: tool name and category only, projected on the server.
- Signed-in neighbours see first names only. Emails are visible to admins only.
- Notification payload: recipient first name, email and role (lender or borrower), tool name, dates, counterpart first
  name. No ids of people, descriptions, notes or the counterpart's email.
- Overdue feed: loan id, reminder key, borrower first name and email, tool name, end date.
- n8n stores error executions only; successful executions can be pruned (see production.md).
