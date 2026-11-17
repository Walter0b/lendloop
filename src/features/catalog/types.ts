import type { FunctionReturnType } from "convex/server";
import type { api } from "@convex/_generated/api";

export type ToolView = FunctionReturnType<typeof api.catalog.queries.board>[number];
export type { Category, Condition, ToolInput } from "@convex/catalog/domain/tool";
export { CATEGORIES, CONDITIONS } from "@convex/catalog/domain/tool";
