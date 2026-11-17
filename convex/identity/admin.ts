import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { adminMutation, adminQuery } from "../shared/functions";
import { fail } from "../shared/errors";
import { roleValidator } from "./table";

export const listUsers = adminQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(500);
    return users.map((u) => ({
      id: u._id, name: u.name, email: u.email, role: u.role, trustedLender: u.trustedLender,
    }));
  },
});

export const setTrustedLender = adminMutation({
  args: { userId: v.id("users"), trusted: v.boolean() },
  handler: async (ctx, { userId, trusted }) => {
    const user = await ctx.db.get(userId);
    if (!user) fail("NOT_FOUND", "User not found.");
    await ctx.db.patch(userId, { trustedLender: trusted });
  },
});

// npx convex run identity/admin:setRole '{"email":"a@b.c","role":"admin"}'
export const setRole = internalMutation({
  args: { email: v.string(), role: roleValidator },
  handler: async (ctx, { email, role }) => {
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).unique();
    if (!user) fail("NOT_FOUND", `No user with email ${email}. Sign in once first.`);
    await ctx.db.patch(user._id, { role });
    return user._id;
  },
});
