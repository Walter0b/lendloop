// @vitest-environment edge-runtime
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../convex/_generated/api";
import { approvedLoan, day, expectCode, listTool, makeTest, signIn } from "./setup";

beforeEach(() => vi.useFakeTimers());

async function scene() {
  const t = makeTest();
  const lina = await signIn(t, "Lina");
  const sam = await signIn(t, "Sam");
  const kofi = await signIn(t, "Kofi");
  const toolId = await listTool(lina);
  return { t, lina, sam, kofi, toolId };
}

describe("loans, enforced in Convex", () => {
  it("only the lender decides; borrowers and strangers cannot", async () => {
    const { lina, sam, kofi, toolId } = await scene();
    const loanId = await sam.mutation(api.lending.requests.create, { toolId, startDate: day(1), endDate: day(2) });
    await expectCode(sam.mutation(api.lending.decisions.approve, { loanId }), "FORBIDDEN");
    await expectCode(kofi.mutation(api.lending.decisions.decline, { loanId }), "FORBIDDEN");
    await expectCode(lina.mutation(api.lending.requests.create, { toolId, startDate: day(1), endDate: day(1) }), "FORBIDDEN");
    await lina.mutation(api.lending.decisions.approve, { loanId });
  });

  it("a lender can cancel a booked loan before it starts, and the borrower is told", async () => {
    const { t, lina, sam, toolId } = await scene();
    const loanId = await approvedLoan(t, toolId, lina.id, sam.id, 2, 4);
    await expectCode(lina.mutation(api.lending.decisions.markReturned, { loanId }), "CONFLICT");
    await lina.mutation(api.lending.decisions.cancel, { loanId });
    const events = await t.run((ctx) => ctx.db.query("outbox").collect());
    expect(events.map((e) => e.recipient)).toEqual(["borrower"]);
  });

  it("nobody cancels a loan that has started", async () => {
    const { t, lina, sam, toolId } = await scene();
    const loanId = await approvedLoan(t, toolId, lina.id, sam.id, -2, 1);
    await expectCode(sam.mutation(api.lending.decisions.cancel, { loanId }), "CONFLICT");
    await lina.mutation(api.lending.decisions.markReturned, { loanId });
  });

  it("admin-only functions reject regular users", async () => {
    const { sam } = await scene();
    await expectCode(sam.query(api.lending.queries.all, {}), "FORBIDDEN");
    await expectCode(sam.mutation(api.identity.admin.setTrustedLender, { userId: sam.id, trusted: true }), "FORBIDDEN");
  });
});
