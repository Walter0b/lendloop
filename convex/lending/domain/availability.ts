import { daysBetween, overlaps, type DateRange, type IsoDay } from "./dates";
import type { LoanStatus } from "./status";

type LoanLike = DateRange & { status: LoanStatus };

export type Availability = { state: "available" } | { state: "on_loan"; until: IsoDay };

export function availabilityOf(loans: LoanLike[], today: IsoDay): Availability {
  const current = loans.find((l) => l.status === "approved" && l.startDate <= today);
  return current ? { state: "on_loan", until: current.endDate } : { state: "available" };
}

export const conflictsWith = (approved: LoanLike[], range: DateRange): boolean =>
  approved.some((l) => l.status === "approved" && overlaps(l, range));

export const isOverdue = (loan: LoanLike, today: IsoDay): boolean =>
  loan.status === "approved" && loan.endDate < today;

export const daysOverdue = (loan: LoanLike, today: IsoDay): number =>
  Math.max(0, daysBetween(loan.endDate, today));
