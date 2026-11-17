import { v } from "convex/values";
import { userMutation } from "../shared/functions";
import { ensure } from "../shared/errors";
import { conflictsWith } from "./domain/availability";
import { overlaps } from "./domain/dates";
import { loanFor, moveLoan } from "./service";
import { loansOfTool } from "./read";
import { assertTransition } from "./domain/status";

const args = { loanId: v.id("loans") };

export const approve = userMutation({
  args,
  handler: async (ctx, { loanId }) => {
    const loan = await loanFor(ctx, loanId, ctx.viewer, "approve");
    assertTransition(loan.status, "approved");
    const approved = await loansOfTool(ctx, loan.toolId, "approved");
    ensure(!conflictsWith(approved, loan), "CONFLICT", "Another loan already covers those days.");
    await moveLoan(ctx, loan, "approved");
    const rivals = (await loansOfTool(ctx, loan.toolId, "requested")).filter((l) => l._id !== loan._id);
    for (const rival of rivals.filter((r) => overlaps(r, loan))) await moveLoan(ctx, rival, "declined");
  },
});

export const decline = userMutation({
  args,
  handler: async (ctx, { loanId }) => {
    await moveLoan(ctx, await loanFor(ctx, loanId, ctx.viewer, "decline"), "declined");
  },
});

export const markReturned = userMutation({
  args,
  handler: async (ctx, { loanId }) => {
    await moveLoan(ctx, await loanFor(ctx, loanId, ctx.viewer, "markReturned"), "returned");
  },
});

export const cancel = userMutation({
  args,
  handler: async (ctx, { loanId }) => {
    const loan = await loanFor(ctx, loanId, ctx.viewer, "cancel");
    await moveLoan(ctx, loan, "cancelled", loan.borrowerId === ctx.user._id ? "lender" : "borrower");
  },
});
