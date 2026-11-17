import { defineTable } from "convex/server";
import { v } from "convex/values";
import { LOAN_STATUSES } from "./domain/status";

export const loanStatusValidator = v.union(...LOAN_STATUSES.map((s) => v.literal(s)));

export const loans = defineTable({
  toolId: v.id("tools"),
  lenderId: v.id("users"),
  borrowerId: v.id("users"),
  startDate: v.string(),
  endDate: v.string(),
  status: loanStatusValidator,
  note: v.optional(v.string()),
  updatedAt: v.number(),
})
  .index("by_tool_status", ["toolId", "status"])
  .index("by_borrower", ["borrowerId"])
  .index("by_lender", ["lenderId"])
  .index("by_status_end", ["status", "endDate"]);
