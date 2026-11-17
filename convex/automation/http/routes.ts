import { internal } from "../../_generated/api";
import { isoDay } from "../../lending/domain/dates";
import { signedRoute } from "./signedRoute";

export const overdueLoans = signedRoute("overdue.query", async (ctx) => {
  const today = isoDay(Date.now());
  const loans = await ctx.runQuery(internal.automation.overdue.list, { today });
  return { today, loans };
});

// The mutations' arg validators check the body shape.
export const reminderResult = signedRoute("reminder.result", (ctx, body) =>
  ctx.runMutation(internal.automation.writeBacks.recordReminder, body as never),
);

export const notificationResult = signedRoute("notification.result", (ctx, body) =>
  ctx.runMutation(internal.automation.writeBacks.recordNotification, body as never),
);

export const workflowFailure = signedRoute("workflow.failure", (ctx, body) =>
  ctx.runMutation(internal.automation.failures.record, body as never),
);
