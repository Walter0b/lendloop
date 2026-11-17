import { isAdmin, type Viewer } from "../../identity/domain/viewer";
import type { LoanStatus } from "./status";

type Parties = { lenderId: string; borrowerId: string; status: LoanStatus };

export const loanPolicy = {
  request: (viewer: Viewer, tool: { ownerId: string }) => tool.ownerId !== viewer.id,
  approve: (viewer: Viewer, loan: Parties) => loan.lenderId === viewer.id,
  decline: (viewer: Viewer, loan: Parties) => loan.lenderId === viewer.id,
  markReturned: (viewer: Viewer, loan: Parties) => loan.lenderId === viewer.id,
  cancel: (viewer: Viewer, loan: Parties) =>
    loan.borrowerId === viewer.id || (loan.lenderId === viewer.id && loan.status === "approved"),
  view: (viewer: Viewer, loan: Parties) =>
    isAdmin(viewer) || loan.lenderId === viewer.id || loan.borrowerId === viewer.id,
};

export type LoanAction = Exclude<keyof typeof loanPolicy, "request" | "view">;
