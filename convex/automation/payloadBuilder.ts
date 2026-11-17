import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { publicName } from "../identity/domain/viewer";
import { recipientOf } from "./domain/events";
import { buildPayload, type NotificationPayload } from "./domain/payload";

export async function notificationPayload(
  ctx: QueryCtx,
  job: Doc<"outbox">,
): Promise<NotificationPayload | null> {
  const loan = await ctx.db.get(job.loanId);
  if (!loan) return null;
  const [tool, lender, borrower] = await Promise.all([
    ctx.db.get(loan.toolId), ctx.db.get(loan.lenderId), ctx.db.get(loan.borrowerId),
  ]);
  if (!tool || !lender || !borrower) return null;
  const role = job.recipient ?? recipientOf(job.type);
  const toLender = role === "lender";
  const [recipient, counterpart] = toLender ? [lender, borrower] : [borrower, lender];
  return buildPayload({
    eventId: job.eventId,
    type: job.type,
    occurredAtMs: job._creationTime,
    recipient: { firstName: publicName(recipient.name), email: recipient.email, role },
    loan: {
      toolName: tool.name,
      startDate: loan.startDate,
      endDate: loan.endDate,
      counterpartFirstName: publicName(counterpart.name),
    },
  });
}
