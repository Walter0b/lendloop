import { internalMutation } from "../_generated/server";
import { recordActivity } from "./activity";

export const SILENCE_LIMIT_MS = 15 * 60_000;

export const flagSilentRuns = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - SILENCE_LIMIT_MS;
    const accepted = await ctx.db
      .query("outbox")
      .withIndex("by_status", (q) => q.eq("status", "accepted"))
      .take(500);
    const silent = accepted.filter((job) => (job.acceptedAt ?? job._creationTime) < cutoff);
    for (const job of silent) {
      await ctx.db.patch(job._id, { status: "failed", lastError: "n8n accepted the event but never reported back" });
      await recordActivity(ctx, {
        loanId: job.loanId,
        key: `delivery-silent:${job.eventId}`,
        message: "Notification status unknown (n8n never reported back)",
        tone: "error",
      });
    }
    return { flagged: silent.length };
  },
});
