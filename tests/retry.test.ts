import { describe, expect, it } from "vitest";
import { backoffMs, isTransient, shouldRetry } from "../convex/automation/domain/retry";
import { recipientOf } from "../convex/automation/domain/events";
import { reminderKey } from "../convex/automation/domain/payload";

describe("delivery retries", () => {
  it("backs off exponentially and stops after 5 attempts", () => {
    expect([1, 2, 3, 4].map(backoffMs)).toEqual([30_000, 60_000, 120_000, 240_000]);
    expect(shouldRetry(4)).toBe(true);
    expect(shouldRetry(5)).toBe(false);
  });

  it("retries only transient failures", () => {
    expect(isTransient(null)).toBe(true);
    expect(isTransient(503)).toBe(true);
    expect(isTransient(429)).toBe(true);
    expect(isTransient(404)).toBe(true);
    expect(isTransient(401)).toBe(false);
    expect(isTransient(400)).toBe(false);
  });
});

describe("event routing", () => {
  it("notifies the party who did not act", () => {
    expect(recipientOf("loan.requested")).toBe("lender");
    expect(recipientOf("loan.approved")).toBe("borrower");
  });

  it("uses one reminder key per loan per day", () => {
    expect(reminderKey("loan1", "2026-11-16")).toBe("loan1:2026-11-16");
  });
});
