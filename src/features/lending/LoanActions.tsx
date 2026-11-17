"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ErrorText } from "@/shared/ui/ErrorText";
import { useSubmit } from "@/shared/useSubmit";
import type { LoanAction, LoanView } from "./types";

const LABELS: Record<LoanAction, { text: (loan: LoanView) => string; style: string }> = {
  approve: { text: () => "Approve", style: "primary" },
  decline: { text: () => "Decline", style: "" },
  markReturned: { text: () => "Mark as returned", style: "primary" },
  cancel: { text: (loan) => (loan.status === "approved" ? "Cancel loan" : "Cancel request"), style: "" },
};

export function LoanActions({ loan }: { loan: LoanView }) {
  const mutations = {
    approve: useMutation(api.lending.decisions.approve),
    decline: useMutation(api.lending.decisions.decline),
    markReturned: useMutation(api.lending.decisions.markReturned),
    cancel: useMutation(api.lending.decisions.cancel),
  };
  const { run, pending, error } = useSubmit((action: LoanAction) => mutations[action]({ loanId: loan.id }));
  if (loan.actions.length === 0) return null;
  return (
    <>
      <div className="row">
        {loan.actions.map((a) => (
          <button key={a} className={`btn ${LABELS[a].style}`} disabled={pending} onClick={() => run(a)}>
            {LABELS[a].text(loan)}
          </button>
        ))}
      </div>
      <ErrorText message={error} />
    </>
  );
}
