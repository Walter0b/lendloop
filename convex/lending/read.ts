import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { availabilityOf } from "./domain/availability";
import type { IsoDay } from "./domain/dates";
import type { LoanStatus } from "./domain/status";

export const loansOfTool = (ctx: QueryCtx, toolId: Id<"tools">, status: LoanStatus) =>
  ctx.db
    .query("loans")
    .withIndex("by_tool_status", (q) => q.eq("toolId", toolId).eq("status", status))
    .collect();

export async function availabilityFor(ctx: QueryCtx, toolId: Id<"tools">, today: IsoDay) {
  return availabilityOf(await loansOfTool(ctx, toolId, "approved"), today);
}

export async function pendingRequestCount(ctx: QueryCtx, toolId: Id<"tools">) {
  return (await loansOfTool(ctx, toolId, "requested")).length;
}
