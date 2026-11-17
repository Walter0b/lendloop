// @vitest-environment edge-runtime
import { beforeEach, describe, expect, it, vi } from "vitest";
import { internal } from "../../convex/_generated/api";
import { SILENCE_LIMIT_MS } from "../../convex/automation/watchdog";
import { approvedLoan, day, listTool, makeTest, signIn } from "./setup";

beforeEach(() => vi.useFakeTimers());

async function overdueLoan() {
  const t = makeTest();
  const lina = await signIn(t, "Lina");
  const sam = await signIn(t, "Sam");
  const loanId = await approvedLoan(t, await listTool(lina), lina.id, sam.id, -5, -2);
  return { t, loanId };
}

describe("n8n write-backs and the watchdog", () => {
  it("a retried reminder write-back is stored once and drops the loan from the list", async () => {
    const { t } = await overdueLoan();
    const [row] = await t.query(internal.automation.overdue.list, { today: day(0) });
    const report = { reminderKey: row.reminderKey, status: "sent" as const };
    expect(await t.mutation(internal.automation.writeBacks.recordReminder, report)).toEqual({ result: "recorded" });
    expect(await t.mutation(internal.automation.writeBacks.recordReminder, report)).toEqual({ result: "duplicate" });
    expect(await t.run((ctx) => ctx.db.query("reminders").collect())).toHaveLength(1);
    expect(await t.query(internal.automation.overdue.list, { today: day(0) })).toEqual([]);
  });

  it("flags events n8n accepted but never confirmed", async () => {
    const { t, loanId } = await overdueLoan();
    await t.run((ctx) => ctx.db.insert("outbox", {
      eventId: "e1", loanId, type: "loan.approved", status: "accepted", attempts: 1, acceptedAt: Date.now(),
    }));
    expect(await t.mutation(internal.automation.watchdog.flagSilentRuns, {})).toEqual({ flagged: 0 });
    vi.setSystemTime(Date.now() + SILENCE_LIMIT_MS + 1000);
    expect(await t.mutation(internal.automation.watchdog.flagSilentRuns, {})).toEqual({ flagged: 1 });
    const [job] = await t.run((ctx) => ctx.db.query("outbox").collect());
    expect(job.status).toBe("failed");
  });
});
