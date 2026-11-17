import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { publicName } from "../identity/domain/viewer";
import { daysOverdue } from "../lending/domain/availability";
import { reminderKey, type OverdueLoan } from "./domain/payload";

const BATCH = 200;

export const list = internalQuery({
  args: { today: v.string() },
  handler: async (ctx, { today }): Promise<OverdueLoan[]> => {
    const overdue = ctx.db
      .query("loans")
      .withIndex("by_status_end", (q) => q.eq("status", "approved").lt("endDate", today));
    const rows: OverdueLoan[] = [];
    for await (const loan of overdue) {
      if (rows.length >= BATCH) break;
      const key = reminderKey(loan._id, today);
      const sent = await ctx.db.query("reminders").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (sent?.status === "sent") continue;
      const [tool, borrower] = await Promise.all([ctx.db.get(loan.toolId), ctx.db.get(loan.borrowerId)]);
      if (!tool || !borrower) continue;
      rows.push({
        loanId: loan._id,
        reminderKey: key,
        borrower: { firstName: publicName(borrower.name), email: borrower.email },
        toolName: tool.name,
        endDate: loan.endDate,
        daysOverdue: daysOverdue(loan, today),
      });
    }
    return rows;
  },
});
