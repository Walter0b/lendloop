import { fail } from "../../shared/errors";

export type IsoDay = string;
export type DateRange = { startDate: IsoDay; endDate: IsoDay };

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_LOAN_DAYS = 30;
const DAY_MS = 86_400_000;

export const isoDay = (ms: number): IsoDay => new Date(ms).toISOString().slice(0, 10);

// One day of slack so users west of UTC can still pick their local today.
export const earliestStart = (nowMs: number): IsoDay => isoDay(nowMs - DAY_MS);

export const daysBetween = (from: IsoDay, to: IsoDay): number =>
  Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

export function validateRange(range: DateRange, today: IsoDay): void {
  const { startDate, endDate } = range;
  if (!ISO_DAY.test(startDate) || !ISO_DAY.test(endDate)) fail("INVALID", "Use YYYY-MM-DD dates.");
  if (Number.isNaN(Date.parse(startDate)) || Number.isNaN(Date.parse(endDate))) {
    fail("INVALID", "That date does not exist.");
  }
  if (startDate < today) fail("INVALID", "The loan cannot start in the past.");
  if (endDate < startDate) fail("INVALID", "The end date must be on or after the start date.");
  if (daysBetween(startDate, endDate) + 1 > MAX_LOAN_DAYS) {
    fail("INVALID", `Loans are limited to ${MAX_LOAN_DAYS} days.`);
  }
}

export const overlaps = (a: DateRange, b: DateRange): boolean =>
  a.startDate <= b.endDate && b.startDate <= a.endDate;
