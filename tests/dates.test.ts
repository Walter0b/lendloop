import { describe, expect, it } from "vitest";
import { overlaps, validateRange } from "../convex/lending/domain/dates";
import { availabilityOf, conflictsWith, daysOverdue, isOverdue } from "../convex/lending/domain/availability";

const today = "2026-11-16";

describe("date ranges", () => {
  it("accepts a valid range and rejects bad ones", () => {
    expect(() => validateRange({ startDate: today, endDate: "2026-11-18" }, today)).not.toThrow();
    expect(() => validateRange({ startDate: "2026-11-15", endDate: today }, today)).toThrow(/past/);
    expect(() => validateRange({ startDate: today, endDate: "2026-11-10" }, today)).toThrow(/end date/);
    expect(() => validateRange({ startDate: today, endDate: "2027-01-30" }, today)).toThrow(/30 days/);
    expect(() => validateRange({ startDate: "16/11/2026", endDate: today }, today)).toThrow(/YYYY/);
  });

  it("treats shared days as overlap", () => {
    expect(overlaps({ startDate: "2026-11-01", endDate: "2026-11-05" }, { startDate: "2026-11-05", endDate: "2026-11-06" })).toBe(true);
    expect(overlaps({ startDate: "2026-11-01", endDate: "2026-11-04" }, { startDate: "2026-11-05", endDate: "2026-11-06" })).toBe(false);
  });
});

describe("availability and overdue", () => {
  const loan = { startDate: "2026-11-10", endDate: "2026-11-14", status: "approved" as const };

  it("is on loan while an approved loan has started and is not returned", () => {
    expect(availabilityOf([loan], today)).toEqual({ state: "on_loan", until: "2026-11-14" });
    expect(availabilityOf([{ ...loan, status: "returned" }], today)).toEqual({ state: "available" });
    expect(availabilityOf([{ ...loan, startDate: "2026-12-01", endDate: "2026-12-02" }], today).state).toBe("available");
  });

  it("detects overdue loans and booking conflicts", () => {
    expect(isOverdue(loan, today)).toBe(true);
    expect(daysOverdue(loan, today)).toBe(2);
    expect(isOverdue({ ...loan, status: "returned" }, today)).toBe(false);
    expect(conflictsWith([loan], { startDate: "2026-11-14", endDate: "2026-11-20" })).toBe(true);
  });
});
