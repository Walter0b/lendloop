# Architecture

```
Browser (Next.js + Clerk) ──JWT──▶ Convex queries/mutations ──outbox──▶ deliver action
                                        ▲                                 │ HMAC POST
                                        │ HMAC POST write-backs           ▼
                                   Convex HTTP routes ◀──────────── n8n workflows
```

## Bounded contexts
Each context in `convex/` has a `domain/` folder with pure TypeScript rules, a `table.ts`
schema slice, and thin Convex functions that load data, call the domain and save.

| Context | Owns | Key rules (`domain/`) |
|---|---|---|
| identity | users, roles, Trusted Lender flag | `Viewer`, `publicName` (first name only) |
| catalog | tool listings | categories, conditions, input limits, who may edit or remove |
| lending | loans (requests) | lifecycle state machine, date ranges, overlap, overdue, per-party actions |
| automation | outbox, activity, reminders, failures | event routing, payload shape, HMAC, retry policy |

Contexts talk through small published functions, not each other's tables:
catalog asks `lending/read.ts` for availability and calls `lending/closure.ts` before a
listing is removed; lending calls `automation/outbox.ts` to publish an event.

## Loan lifecycle
```
requested ──approve──▶ approved ──markReturned (lender, once started)──▶ returned
    │ decline / cancel      │ cancel (either party, before start; admin removal anytime)
    ▼                       ▼
 declined / cancelled    cancelled
```
`lending/service.ts#moveLoan` is the only place a status changes. It checks the transition,
patches the loan and publishes `loan.<status>`, so no change can skip its notification.
Approving a request declines other requests for overlapping days. Removing a listing
declines its pending requests and cancels its booked loans (owners cannot remove a tool
that is lent out; admins can, and the borrower is notified).

## Request flow (notification)
1. A mutation changes a loan and, in the same transaction, inserts an `outbox` row,
   an `activity` row ("Request sent") and schedules `automation/delivery:deliver`.
2. `deliver` builds a minimal payload, signs it and POSTs it to n8n. Retries with backoff.
3. n8n verifies, answers 202, notifies the recipient and calls `/automation/notifications`.
4. The loan card shows "Notification delivered · 2 minutes ago".

## Frontend
`src/features/<context>` mirrors the backend. Pages in `src/app/(app)` are one-liners.
Components never decide permissions: the loan query returns `actions` computed by the
same domain policy the mutations enforce, and the UI renders exactly those buttons.
