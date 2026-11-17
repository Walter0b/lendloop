import type { LoanEventType, Party } from "./events";

export type NotificationPayload = {
  version: 1;
  kind: "loan-event";
  eventId: string;
  type: LoanEventType;
  occurredAt: string;
  recipient: { firstName: string; email: string; role: Party };
  loan: { toolName: string; startDate: string; endDate: string; counterpartFirstName: string };
};

type Input = Omit<NotificationPayload, "version" | "kind" | "occurredAt"> & { occurredAtMs: number };

export function buildPayload({ occurredAtMs, ...rest }: Input): NotificationPayload {
  return { version: 1, kind: "loan-event", occurredAt: new Date(occurredAtMs).toISOString(), ...rest };
}

export type OverdueLoan = {
  loanId: string;
  reminderKey: string;
  borrower: { firstName: string; email: string };
  toolName: string;
  endDate: string;
  daysOverdue: number;
};

export const reminderKey = (loanId: string, today: string) => `${loanId}:${today}`;
