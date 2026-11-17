import type { LoanStatus } from "../../lending/domain/status";

export const LOAN_EVENTS = [
  "loan.requested", "loan.approved", "loan.declined", "loan.cancelled", "loan.returned",
] as const;
export type LoanEventType = (typeof LOAN_EVENTS)[number];

export const eventFor = (status: LoanStatus): LoanEventType => `loan.${status}`;

export type Party = "lender" | "borrower";

const RECIPIENT: Record<LoanEventType, Party> = {
  "loan.requested": "lender",
  "loan.cancelled": "lender",
  "loan.approved": "borrower",
  "loan.declined": "borrower",
  "loan.returned": "borrower",
};

export const recipientOf = (type: LoanEventType) => RECIPIENT[type];

export const EVENT_LABEL: Record<LoanEventType, string> = {
  "loan.requested": "Request sent",
  "loan.approved": "Request approved",
  "loan.declined": "Request declined",
  "loan.cancelled": "Loan cancelled",
  "loan.returned": "Marked as returned",
};
