import { v } from "convex/values";
import { userMutation } from "../shared/functions";
import { ensure, fail } from "../shared/errors";
import { publishLoanEvent } from "../automation/outbox";
import { conflictsWith } from "./domain/availability";
import { earliestStart, overlaps, validateRange } from "./domain/dates";
import { loanPolicy } from "./domain/policy";
import { loansOfTool } from "./read";

const MAX_NOTE = 200;

export const create = userMutation({
  args: { toolId: v.id("tools"), startDate: v.string(), endDate: v.string(), note: v.optional(v.string()) },
  handler: async (ctx, { toolId, startDate, endDate, note }) => {
    const tool = await ctx.db.get(toolId);
    if (!tool || tool.status !== "listed") fail("NOT_FOUND", "This tool is no longer listed.");
    ensure(loanPolicy.request(ctx.viewer, tool), "FORBIDDEN", "You cannot borrow your own tool.");
    const range = { startDate, endDate };
    validateRange(range, earliestStart(Date.now()));
    ensure((note ?? "").length <= MAX_NOTE, "INVALID", `Notes are limited to ${MAX_NOTE} characters.`);
    const approved = await loansOfTool(ctx, toolId, "approved");
    ensure(!conflictsWith(approved, range), "CONFLICT", "The tool is already booked for those days.");
    const mine = (await loansOfTool(ctx, toolId, "requested")).filter((l) => l.borrowerId === ctx.user._id);
    ensure(!mine.some((l) => overlaps(l, range)), "CONFLICT", "You already asked for these days.");
    const loanId = await ctx.db.insert("loans", {
      toolId,
      lenderId: tool.ownerId,
      borrowerId: ctx.user._id,
      ...range,
      note: note?.trim() || undefined,
      status: "requested",
      updatedAt: Date.now(),
    });
    await publishLoanEvent(ctx, loanId, "loan.requested");
    return loanId;
  },
});
