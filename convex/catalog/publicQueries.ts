import { query } from "../_generated/server";
import { isoDay } from "../lending/domain/dates";
import { availabilityFor } from "../lending/read";

export const listAvailable = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_status_category", (q) => q.eq("status", "listed"))
      .take(100);
    const today = isoDay(Date.now());
    const rows = await Promise.all(
      tools.map(async (t) => ({ tool: t, availability: await availabilityFor(ctx, t._id, today) })),
    );
    return rows
      .filter((r) => r.availability.state === "available")
      .map(({ tool }) => ({ id: tool._id, name: tool.name, category: tool.category }));
  },
});
