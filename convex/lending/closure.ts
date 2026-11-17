import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { isAdmin, type Viewer } from "../identity/domain/viewer";
import { ensure } from "../shared/errors";
import { loansOfTool } from "./read";
import { moveLoan } from "./service";

export async function closeLoansBeforeRemoval(ctx: MutationCtx, toolId: Id<"tools">, viewer: Viewer) {
  const approved = await loansOfTool(ctx, toolId, "approved");
  ensure(
    approved.length === 0 || isAdmin(viewer),
    "CONFLICT",
    `This tool is booked until ${approved[0]?.endDate}. Cancel the loan, or mark it returned, first.`,
  );
  for (const loan of approved) await moveLoan(ctx, loan, "cancelled", "borrower");
  for (const loan of await loansOfTool(ctx, toolId, "requested")) {
    await moveLoan(ctx, loan, "declined");
  }
}
