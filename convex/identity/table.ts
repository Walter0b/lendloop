import { defineTable } from "convex/server";
import { v } from "convex/values";

export const roleValidator = v.union(v.literal("admin"), v.literal("user"));

export const users = defineTable({
  tokenIdentifier: v.string(),
  name: v.string(),
  email: v.string(),
  role: roleValidator,
  trustedLender: v.boolean(),
})
  .index("by_token", ["tokenIdentifier"])
  .index("by_email", ["email"]);
