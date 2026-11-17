import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { Viewer } from "../identity/domain/viewer";
import { publishLoanEvent } from "../automation/outbox";
import { eventFor, type Party } from "../automation/domain/events";
import { ensure, fail } from "../shared/errors";
import { timingAllows, TIMING_ERROR } from "./domain/actions";
import { isoDay } from "./domain/dates";
import { loanPolicy, type LoanAction } from "./domain/policy";
import { assertTransition, type LoanStatus } from "./domain/status";

export async function loanFor(ctx: MutationCtx, loanId: Id<"loans">, viewer: Viewer, action: LoanAction) {
  const loan = await ctx.db.get(loanId);
  if (!loan) fail("NOT_FOUND", "Loan not found.");
  if (!loanPolicy[action](viewer, loan)) fail("FORBIDDEN", "You cannot do that on this loan.");
  ensure(timingAllows(action, loan, isoDay(Date.now())), "CONFLICT", TIMING_ERROR[action]);
  return loan;
}

export async function moveLoan(ctx: MutationCtx, loan: Doc<"loans">, to: LoanStatus, notify?: Party) {
  assertTransition(loan.status, to);
  await ctx.db.patch(loan._id, { status: to, updatedAt: Date.now() });
  await publishLoanEvent(ctx, loan._id, eventFor(to), notify);
}
