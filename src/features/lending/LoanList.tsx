import { LoanCard } from "./LoanCard";
import type { LoanView } from "./types";

type Props = {
  loans: LoanView[] | undefined;
  perspective: "lender" | "borrower" | "admin";
  empty: string;
};

export function LoanList({ loans, perspective, empty }: Props) {
  if (loans === undefined) return <p className="muted">Loading...</p>;
  if (loans.length === 0) return <p className="muted">{empty}</p>;
  const open = loans.filter((l) => l.status === "requested" || l.status === "approved");
  const past = loans.filter((l) => !open.includes(l));
  return (
    <>
      <div className="grid">{open.map((l) => <LoanCard key={l.id} loan={l} perspective={perspective} />)}</div>
      {past.length > 0 && <h2 className="section">History</h2>}
      <div className="grid">{past.map((l) => <LoanCard key={l.id} loan={l} perspective={perspective} />)}</div>
    </>
  );
}
