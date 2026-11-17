import { v } from "convex/values";
import { userMutation } from "../shared/functions";
import { ensure, fail } from "../shared/errors";
import { closeLoansBeforeRemoval } from "../lending/closure";
import { canEditTool, canRemoveTool } from "./domain/policy";
import { validateToolInput } from "./domain/tool";
import { toolFields } from "./table";

export const create = userMutation({
  args: toolFields,
  handler: async (ctx, input) =>
    ctx.db.insert("tools", { ...validateToolInput(input), ownerId: ctx.user._id, status: "listed" }),
});

export const update = userMutation({
  args: { toolId: v.id("tools"), ...toolFields },
  handler: async (ctx, { toolId, ...input }) => {
    const tool = await ctx.db.get(toolId);
    if (!tool || tool.status !== "listed") fail("NOT_FOUND", "Listing not found.");
    ensure(canEditTool(ctx.viewer, tool), "FORBIDDEN", "You can only edit your own listings.");
    await ctx.db.patch(toolId, validateToolInput(input));
  },
});

export const remove = userMutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, { toolId }) => {
    const tool = await ctx.db.get(toolId);
    if (!tool || tool.status !== "listed") fail("NOT_FOUND", "Listing not found.");
    ensure(canRemoveTool(ctx.viewer, tool), "FORBIDDEN", "You can only remove your own listings.");
    await closeLoansBeforeRemoval(ctx, toolId, ctx.viewer);
    await ctx.db.patch(toolId, { status: "removed" });
  },
});
