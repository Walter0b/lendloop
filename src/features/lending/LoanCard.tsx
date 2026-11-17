import { Badge } from "@/shared/ui/Badge";
import { formatDay } from "@/shared/time";
import { ActivityList } from "@/features/automation/ActivityList";
import { LoanActions } from "./LoanActions";
import type { LoanView } from "./types";

const STATUS_TONE = {
  requested: "info", approved: "ok", declined: "neutral", cancelled: "neutral", returned: "neutral",
} as const;

export function LoanCard({ loan, perspective }: { loan: LoanView; perspective: "lender" | "borrower" | "admin" }) {
  const who =
    perspective === "lender" ? `Requested by ${loan.borrower.name}`
    : perspective === "borrower" ? `Lent by ${loan.lender.name}`
    : `${loan.lender.name} to ${loan.borrower.name}`;
  return (
    <article className="card">
      <div className="card-head">
        <h3>{loan.toolName}</h3>
        <span className="row">
          {loan.overdue && <Badge tone="danger">Overdue</Badge>}
          <Badge tone={STATUS_TONE[loan.status]}>{loan.status}</Badge>
        </span>
      </div>
      <p className="meta">
        {formatDay(loan.startDate)} to {formatDay(loan.endDate)} · {who}
        {loan.lender.trusted && perspective !== "lender" && <> <Badge tone="info">Trusted Lender</Badge></>}
      </p>
      {loan.note && <p className="note">&ldquo;{loan.note}&rdquo;</p>}
      <ActivityList entries={loan.activity} />
      <LoanActions loan={loan} />
    </article>
  );
}
