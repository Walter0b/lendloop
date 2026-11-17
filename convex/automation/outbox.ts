import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { EVENT_LABEL, recipientOf, type LoanEventType, type Party } from "./domain/events";
import { recordActivity } from "./activity";

export async function publishLoanEvent(
  ctx: MutationCtx, loanId: Id<"loans">, type: LoanEventType, recipient: Party = recipientOf(type),
) {
  const eventId = crypto.randomUUID();
  const outboxId = await ctx.db.insert("outbox", { eventId, loanId, type, recipient, status: "pending", attempts: 0 });
  await recordActivity(ctx, { loanId, key: `event:${eventId}`, message: EVENT_LABEL[type], tone: "info" });
  await ctx.scheduler.runAfter(0, internal.automation.delivery.deliver, { outboxId });
}
