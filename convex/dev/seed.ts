import { internalMutation, type MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { isoDay } from "../lending/domain/dates";

const DAY = 86_400_000;

async function neighbour(ctx: MutationCtx, name: string, email: string) {
  const found = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
  if (found) return found._id;
  const tokenIdentifier = `demo|${email}`;
  return ctx.db.insert("users", { tokenIdentifier, name, email, role: "user", trustedLender: false });
}

// npx convex run dev/seed:demo  (includes one loan that is 2 days overdue)
export const demo = internalMutation({
  args: {},
  handler: async (ctx) => {
    const lina = await neighbour(ctx, "Lina Okafor", "lina@example.test");
    const sam = await neighbour(ctx, "Sam Tchami", "sam@example.test");
    await ctx.db.patch(lina, { trustedLender: true });
    const tool = (ownerId: Id<"users">, name: string, category: "garden" | "kitchen" | "power tools") =>
      ctx.db.insert("tools", { ownerId, name, category, condition: "good", description: "", status: "listed" });
    const mower = await tool(lina, "Push lawn mower", "garden");
    await tool(lina, "Stand mixer", "kitchen");
    await tool(sam, "Orbital sander", "power tools");
    const now = Date.now();
    const loanId = await ctx.db.insert("loans", {
      toolId: mower,
      lenderId: lina,
      borrowerId: sam,
      startDate: isoDay(now - 6 * DAY),
      endDate: isoDay(now - 2 * DAY),
      status: "approved",
      updatedAt: now,
    });
    return { loanId };
  },
});
