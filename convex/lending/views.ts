import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { publicName, type Viewer } from "../identity/domain/viewer";
import { recentActivity } from "../automation/activity";
import { availableActions } from "./domain/actions";
import { isOverdue } from "./domain/availability";

export async function toLoanView(ctx: QueryCtx, loan: Doc<"loans">, viewer: Viewer, today: string) {
  const [tool, lender, borrower] = await Promise.all([
    ctx.db.get(loan.toolId), ctx.db.get(loan.lenderId), ctx.db.get(loan.borrowerId),
  ]);
  return {
    id: loan._id,
    toolName: tool?.name ?? "Removed tool",
    category: tool?.category ?? "other",
    startDate: loan.startDate,
    endDate: loan.endDate,
    status: loan.status,
    note: loan.note ?? null,
    overdue: isOverdue(loan, today),
    lender: { name: publicName(lender?.name ?? ""), trusted: lender?.trustedLender ?? false },
    borrower: { name: publicName(borrower?.name ?? "") },
    requestedAt: loan._creationTime,
    actions: availableActions(viewer, loan, today),
    activity: await recentActivity(ctx, loan._id),
  };
}

export type LoanView = Awaited<ReturnType<typeof toLoanView>>;
