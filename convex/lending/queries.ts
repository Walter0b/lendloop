import { adminQuery, userQuery } from "../shared/functions";
import { isoDay } from "./domain/dates";
import { toLoanView } from "./views";

const LIMIT = 100;

export const myRequests = userQuery({
  args: {},
  handler: async (ctx) => {
    const loans = await ctx.db
      .query("loans")
      .withIndex("by_borrower", (q) => q.eq("borrowerId", ctx.user._id))
      .order("desc")
      .take(LIMIT);
    const today = isoDay(Date.now());
    return Promise.all(loans.map((l) => toLoanView(ctx, l, ctx.viewer, today)));
  },
});

export const incoming = userQuery({
  args: {},
  handler: async (ctx) => {
    const loans = await ctx.db
      .query("loans")
      .withIndex("by_lender", (q) => q.eq("lenderId", ctx.user._id))
      .order("desc")
      .take(LIMIT);
    const today = isoDay(Date.now());
    return Promise.all(loans.map((l) => toLoanView(ctx, l, ctx.viewer, today)));
  },
});

export const all = adminQuery({
  args: {},
  handler: async (ctx) => {
    const loans = await ctx.db.query("loans").order("desc").take(LIMIT * 2);
    const today = isoDay(Date.now());
    return Promise.all(loans.map((l) => toLoanView(ctx, l, ctx.viewer, today)));
  },
});
