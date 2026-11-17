// @vitest-environment edge-runtime
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { approvedLoan, expectCode, listTool, makeTest, signIn } from "./setup";

beforeEach(() => vi.useFakeTimers());

describe("listings, enforced in Convex", () => {
  it("anonymous visitors get name and category only, and no board", async () => {
    const t = makeTest();
    await listTool(await signIn(t, "Lina"));
    const rows = await t.query(api.catalog.publicQueries.listAvailable, {});
    expect(Object.keys(rows[0]).sort()).toEqual(["category", "id", "name"]);
    await expectCode(t.query(api.catalog.queries.board, {}), "UNAUTHENTICATED");
  });

  it("only the owner edits or deletes a listing", async () => {
    const t = makeTest();
    const lina = await signIn(t, "Lina");
    const sam = await signIn(t, "Sam");
    const toolId = await listTool(lina);
    const edit = { toolId, name: "Mine now", category: "garden", condition: "fair", description: "" } as const;
    await expectCode(sam.mutation(api.catalog.mutations.update, edit), "FORBIDDEN");
    await expectCode(sam.mutation(api.catalog.mutations.remove, { toolId }), "FORBIDDEN");
  });

  it("an owner cannot delete a tool that is lent out", async () => {
    const t = makeTest();
    const lina = await signIn(t, "Lina");
    const sam = await signIn(t, "Sam");
    const toolId = await listTool(lina);
    await approvedLoan(t, toolId, lina.id, sam.id, -1, 2);
    await expectCode(lina.mutation(api.catalog.mutations.remove, { toolId }), "CONFLICT");
  });

  it("an admin removes any listing and its loans are cancelled, borrower notified", async () => {
    const t = makeTest();
    const lina = await signIn(t, "Lina");
    const sam = await signIn(t, "Sam");
    const admin = await signIn(t, "Ada", "admin");
    const toolId = await listTool(lina);
    const loanId = await approvedLoan(t, toolId, lina.id, sam.id, -1, 2);
    await admin.mutation(api.catalog.mutations.remove, { toolId });
    const loan = await t.run((ctx) => ctx.db.get(loanId));
    expect(loan?.status).toBe("cancelled");
    const events = await t.run((ctx) => ctx.db.query("outbox").collect());
    expect(events.map((e) => [e.type, e.recipient])).toEqual([["loan.cancelled", "borrower"]]);
  });
});
