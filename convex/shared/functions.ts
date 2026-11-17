import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { mutation, query, type QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { fail } from "./errors";

export async function loadViewer(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
}

async function requireUser(ctx: QueryCtx) {
  const user = await loadViewer(ctx);
  if (!user) fail("UNAUTHENTICATED", "Please sign in first.");
  return { user, viewer: { id: user._id as string, role: user.role } };
}

async function requireAdmin(ctx: QueryCtx) {
  const auth = await requireUser(ctx);
  if (auth.user.role !== "admin") fail("FORBIDDEN", "Admins only.");
  return auth;
}

export const userQuery = customQuery(query, customCtx(requireUser));
export const userMutation = customMutation(mutation, customCtx(requireUser));
export const adminQuery = customQuery(query, customCtx(requireAdmin));
export const adminMutation = customMutation(mutation, customCtx(requireAdmin));
