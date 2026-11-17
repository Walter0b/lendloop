/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect } from "vitest";
import schema from "../../convex/schema";
import { api, internal } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const modules = import.meta.glob("../../convex/**/*.*s");
export const DAY = 86_400_000;
export const day = (offset: number) => new Date(Date.now() + offset * DAY).toISOString().slice(0, 10);

export const makeTest = () => convexTest(schema, modules);
type T = ReturnType<typeof makeTest>;

export async function signIn(t: T, name: string, role: "user" | "admin" = "user") {
  const email = `${name.toLowerCase()}@example.test`;
  const as = t.withIdentity({ name, email, tokenIdentifier: `test|${name}` });
  const id = await as.mutation(api.identity.users.store, {});
  if (role === "admin") await t.mutation(internal.identity.admin.setRole, { email, role });
  return Object.assign(as, { id });
}

export async function listTool(as: Awaited<ReturnType<typeof signIn>>, name = "Cordless drill") {
  return as.mutation(api.catalog.mutations.create, {
    name, category: "power tools", condition: "good", description: "",
  });
}

export function approvedLoan(t: T, toolId: Id<"tools">, lenderId: Id<"users">, borrowerId: Id<"users">, start: number, end: number) {
  return t.run((ctx) => ctx.db.insert("loans", {
    toolId, lenderId, borrowerId, startDate: day(start), endDate: day(end), status: "approved", updatedAt: Date.now(),
  }));
}

export async function expectCode(call: Promise<unknown>, code: string) {
  const error = await call.then(() => null, (e: { data?: { code?: string } }) => e);
  expect(error?.data?.code).toBe(code);
}
