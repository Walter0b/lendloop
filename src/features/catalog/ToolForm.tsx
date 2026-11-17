"use client";

import { useState, type FormEvent } from "react";
import { ErrorText } from "@/shared/ui/ErrorText";
import { useSubmit } from "@/shared/useSubmit";
import { ToolFields } from "./ToolFields";
import type { ToolInput } from "./types";

const EMPTY: ToolInput = { name: "", category: "power tools", condition: "good", description: "" };

type Props = {
  initial?: ToolInput;
  submitLabel: string;
  onSubmit: (input: ToolInput) => Promise<unknown>;
  onDone?: () => void;
};

export function ToolForm({ initial = EMPTY, submitLabel, onSubmit, onDone }: Props) {
  const [value, setValue] = useState(initial);
  const { run, pending, error } = useSubmit(onSubmit);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!(await run(value))) return;
    if (initial === EMPTY) setValue(EMPTY);
    onDone?.();
  }

  return (
    <form className="form" onSubmit={submit}>
      <ToolFields value={value} onChange={setValue} />
      <div className="row">
        <button className="btn primary" disabled={pending}>{pending ? "Saving..." : submitLabel}</button>
        {onDone && <button type="button" className="btn" onClick={onDone}>Cancel</button>}
      </div>
      <ErrorText message={error} />
    </form>
  );
}
