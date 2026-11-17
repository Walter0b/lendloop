import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { adminQuery } from "../shared/functions";

export const record = internalMutation({
  args: { executionId: v.string(), workflow: v.string(), node: v.string(), message: v.string() },
  handler: async (ctx, { executionId, workflow, node, message }) => {
    const key = `${workflow}:${executionId}`;
    const existing = await ctx.db.query("failures").withIndex("by_key", (q) => q.eq("key", key)).first();
    if (existing) return { result: "duplicate" as const };
    await ctx.db.insert("failures", { key, workflow, node, message: message.slice(0, 500) });
    return { result: "recorded" as const };
  },
});

export const health = adminQuery({
  args: {},
  handler: async (ctx) => {
    const runs = await ctx.db.query("failures").order("desc").take(20);
    const stuck = await ctx.db.query("outbox").withIndex("by_status", (q) => q.eq("status", "failed")).take(20);
    return {
      failedRuns: runs.map((r) => ({ id: r._id, workflow: r.workflow, node: r.node, message: r.message, at: r._creationTime })),
      failedDeliveries: stuck.map((o) => ({ id: o._id, type: o.type, error: o.lastError ?? "", at: o._creationTime })),
    };
  },
});
