import { defineTable } from "convex/server";
import { v } from "convex/values";
import { CATEGORIES, CONDITIONS } from "./domain/tool";

const literals = <T extends string>(values: readonly T[]) =>
  v.union(...values.map((value) => v.literal(value)));

export const categoryValidator = literals(CATEGORIES);
export const conditionValidator = literals(CONDITIONS);

export const toolFields = {
  name: v.string(),
  category: categoryValidator,
  condition: conditionValidator,
  description: v.string(),
};

export const tools = defineTable({
  ...toolFields,
  ownerId: v.id("users"),
  status: v.union(v.literal("listed"), v.literal("removed")),
})
  .index("by_owner", ["ownerId", "status"])
  .index("by_status_category", ["status", "category"]);
