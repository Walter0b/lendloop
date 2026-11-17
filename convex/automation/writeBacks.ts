import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { recordActivity } from "./activity";

export const recordReminder = internalMutation({
  args: {
    reminderKey: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    detail: v.optional(v.string()),
  },
  handler: async (ctx, { reminderKey: key, status, detail }) => {
    const loanId = ctx.db.normalizeId("loans", key.split(":")[0]);
    if (!loanId || !(await ctx.db.get(loanId))) return { result: "unknown_loan" as const };
    const existing = await ctx.db.query("reminders").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (existing?.status === "sent" || existing?.status === status) return { result: "duplicate" as const };
    if (existing) await ctx.db.patch(existing._id, { status, detail });
    else await ctx.db.insert("reminders", { key, loanId, status, detail });
    await recordActivity(ctx, {
      loanId,
      key: `reminder:${key}:${status}`,
      message: status === "sent" ? "Overdue reminder sent" : "Overdue reminder failed",
      tone: status === "sent" ? "ok" : "error",
    });
    return { result: "recorded" as const };
  },
});

export const recordNotification = internalMutation({
  args: { eventId: v.string(), status: v.union(v.literal("notified"), v.literal("failed")), detail: v.optional(v.string()) },
  handler: async (ctx, { eventId, status, detail }) => {
    const job = await ctx.db.query("outbox").withIndex("by_event", (q) => q.eq("eventId", eventId)).first();
    if (!job) return { result: "unknown_event" as const };
    if (job.status === "notified" || job.status === status) return { result: "duplicate" as const };
    await ctx.db.patch(job._id, { status, lastError: detail });
    await recordActivity(ctx, {
      loanId: job.loanId,
      key: `notification:${eventId}:${status}`,
      message: status === "notified" ? "Notification delivered" : "Notification failed",
      tone: status === "notified" ? "ok" : "error",
    });
    return { result: "recorded" as const };
  },
});
