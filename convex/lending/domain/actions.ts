import type { Viewer } from "../../identity/domain/viewer";
import type { IsoDay } from "./dates";
import { loanPolicy, type LoanAction } from "./policy";
import { canTransition, type LoanStatus } from "./status";

const TARGET: Record<LoanAction, LoanStatus> = {
  approve: "approved",
  decline: "declined",
  markReturned: "returned",
  cancel: "cancelled",
};

type LoanLike = { lenderId: string; borrowerId: string; status: LoanStatus; startDate: IsoDay };

export function timingAllows(action: LoanAction, loan: LoanLike, today: IsoDay): boolean {
  const started = loan.status === "approved" && loan.startDate <= today;
  if (action === "cancel") return !started;
  if (action === "markReturned") return started;
  return true;
}

export const TIMING_ERROR: Record<LoanAction, string> = {
  approve: "",
  decline: "",
  cancel: "This loan has started. The lender marks it returned once the tool is back.",
  markReturned: "This loan has not started yet. Cancel it instead.",
};

export function availableActions(viewer: Viewer, loan: LoanLike, today: IsoDay): LoanAction[] {
  return (Object.keys(TARGET) as LoanAction[]).filter((action) =>
    loanPolicy[action](viewer, loan)
    && canTransition(loan.status, TARGET[action])
    && timingAllows(action, loan, today));
}
