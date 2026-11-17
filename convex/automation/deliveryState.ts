import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation, internalQuery } from "../_generated/server";
import { backoffMs, isTransient, shouldRetry } from "./domain/retry";
import { recordActivity } from "./activity";
import { notificationPayload } from "./payloadBuilder";

export const load = internalQuery({
  args: { outboxId: v.id("outbox") },
  handler: async (ctx, { outboxId }) => {
    const job = await ctx.db.get(outboxId);
    if (!job) return null;
    return { status: job.status, payload: await notificationPayload(ctx, job) };
  },
});

export const recordAttempt = internalMutation({
  args: { outboxId: v.id("outbox"), ok: v.boolean(), httpStatus: v.optional(v.number()), error: v.optional(v.string()) },
  handler: async (ctx, { outboxId, ok, httpStatus, error }) => {
    const job = await ctx.db.get(outboxId);
    if (!job || job.status !== "pending") return;
    const attempts = job.attempts + 1;
    if (ok) {
      await ctx.db.patch(outboxId, { status: "accepted", attempts, lastError: undefined, acceptedAt: Date.now() });
      return;
    }
    if (isTransient(httpStatus ?? null) && shouldRetry(attempts)) {
      await ctx.db.patch(outboxId, { attempts, lastError: error });
      await ctx.scheduler.runAfter(backoffMs(attempts), internal.automation.delivery.deliver, { outboxId });
      return;
    }
    await ctx.db.patch(outboxId, { status: "failed", attempts, lastError: error });
    await recordActivity(ctx, {
      loanId: job.loanId,
      key: `delivery-failed:${job.eventId}`,
      message: "Notification could not be delivered",
      tone: "error",
    });
  },
});
