import { mutation, query } from "../_generated/server";
import { fail } from "../shared/errors";
import { loadViewer } from "../shared/functions";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) fail("UNAUTHENTICATED", "Please sign in first.");
    const profile = {
      name: identity.name ?? identity.givenName ?? "Neighbour",
      email: identity.email ?? "",
    };
    const existing = await loadViewer(ctx);
    if (existing) {
      await ctx.db.patch(existing._id, profile);
      return existing._id;
    }
    return ctx.db.insert("users", {
      ...profile,
      tokenIdentifier: identity.tokenIdentifier,
      role: "user",
      trustedLender: false,
    });
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await loadViewer(ctx);
    if (!user) return null;
    return { id: user._id, name: user.name, role: user.role, trustedLender: user.trustedLender };
  },
});
