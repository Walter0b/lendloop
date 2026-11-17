import { fail } from "../../shared/errors";

export const LOAN_STATUSES = ["requested", "approved", "declined", "cancelled", "returned"] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

const TRANSITIONS: Record<LoanStatus, readonly LoanStatus[]> = {
  requested: ["approved", "declined", "cancelled"],
  approved: ["returned", "cancelled"],
  declined: [],
  cancelled: [],
  returned: [],
};

export const OPEN_STATUSES: readonly LoanStatus[] = ["requested", "approved"];

export const canTransition = (from: LoanStatus, to: LoanStatus): boolean =>
  TRANSITIONS[from].includes(to);

export function assertTransition(from: LoanStatus, to: LoanStatus): void {
  if (!canTransition(from, to)) fail("CONFLICT", `Cannot move a loan from ${from} to ${to}.`);
}
