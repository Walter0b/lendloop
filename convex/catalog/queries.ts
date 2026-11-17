import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { userQuery } from "../shared/functions";
import { publicName } from "../identity/domain/viewer";
import { isoDay } from "../lending/domain/dates";
import { availabilityFor, pendingRequestCount } from "../lending/read";
import { categoryValidator } from "./table";

async function toToolView(ctx: QueryCtx, tool: Doc<"tools">, viewerId: string, today: string) {
  const owner = await ctx.db.get(tool.ownerId);
  const mine = tool.ownerId === viewerId;
  return {
    id: tool._id,
    name: tool.name,
    category: tool.category,
    condition: tool.condition,
    description: tool.description,
    owner: { name: publicName(owner?.name ?? ""), trusted: owner?.trustedLender ?? false },
    mine,
    availability: await availabilityFor(ctx, tool._id, today),
    pendingRequests: mine ? await pendingRequestCount(ctx, tool._id) : 0,
  };
}

export const board = userQuery({
  args: { category: v.optional(categoryValidator) },
  handler: async (ctx, { category }) => {
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_status_category", (q) =>
        category ? q.eq("status", "listed").eq("category", category) : q.eq("status", "listed"))
      .take(200);
    const today = isoDay(Date.now());
    return Promise.all(tools.map((t) => toToolView(ctx, t, ctx.user._id, today)));
  },
});

export const myListings = userQuery({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_owner", (q) => q.eq("ownerId", ctx.user._id).eq("status", "listed"))
      .collect();
    const today = isoDay(Date.now());
    return Promise.all(tools.map((t) => toToolView(ctx, t, ctx.user._id, today)));
  },
});
