import type { FunctionReturnType } from "convex/server";
import type { api } from "@convex/_generated/api";

export type LoanView = FunctionReturnType<typeof api.lending.queries.myRequests>[number];
export type LoanAction = LoanView["actions"][number];
