"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ErrorText } from "@/shared/ui/ErrorText";
import { todayIso } from "@/shared/time";
import { useSubmit } from "@/shared/useSubmit";

export function RequestForm({ toolId, onDone }: { toolId: Id<"tools">; onDone: () => void }) {
  const today = todayIso();
  const [range, setRange] = useState({ startDate: today, endDate: today, note: "" });
  const { run, pending, error } = useSubmit(useMutation(api.lending.requests.create));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (await run({ toolId, ...range, note: range.note || undefined })) onDone();
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="fields">
        <label>From
          <input type="date" required min={today} value={range.startDate}
            onChange={(e) => setRange({ ...range, startDate: e.target.value })} />
        </label>
        <label>Until
          <input type="date" required min={range.startDate} value={range.endDate}
            onChange={(e) => setRange({ ...range, endDate: e.target.value })} />
        </label>
        <label className="wide">Note for the lender (optional)
          <input maxLength={200} value={range.note} onChange={(e) => setRange({ ...range, note: e.target.value })} />
        </label>
      </div>
      <div className="row">
        <button className="btn primary" disabled={pending}>{pending ? "Sending..." : "Send request"}</button>
        <button type="button" className="btn" onClick={onDone}>Cancel</button>
      </div>
      <ErrorText message={error} />
    </form>
  );
}
