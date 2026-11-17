import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Entry = { loanId: Id<"loans">; key: string; message: string; tone: "info" | "ok" | "error" };

export async function recordActivity(ctx: MutationCtx, entry: Entry): Promise<boolean> {
  const existing = await ctx.db
    .query("activity")
    .withIndex("by_key", (q) => q.eq("key", entry.key))
    .first();
  if (existing) return false;
  await ctx.db.insert("activity", entry);
  return true;
}

export async function recentActivity(ctx: QueryCtx, loanId: Id<"loans">, limit = 3) {
  const rows = await ctx.db
    .query("activity")
    .withIndex("by_loan", (q) => q.eq("loanId", loanId))
    .order("desc")
    .take(limit);
  return rows.map((r) => ({ message: r.message, tone: r.tone, at: r._creationTime }));
}
