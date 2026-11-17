"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ErrorText } from "@/shared/ui/ErrorText";
import { useSubmit } from "@/shared/useSubmit";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { ToolForm } from "./ToolForm";
import type { ToolInput, ToolView } from "./types";

export function ListingRow({ tool }: { tool: ToolView }) {
  const [editing, setEditing] = useState(false);
  const update = useMutation(api.catalog.mutations.update);
  const remove = useSubmit(useMutation(api.catalog.mutations.remove));
  const { name, category, condition, description } = tool;
  const save = (input: ToolInput) => update({ toolId: tool.id, ...input });

  if (editing) {
    return (
      <article className="card">
        <ToolForm initial={{ name, category, condition, description }} submitLabel="Save" onSubmit={save} onDone={() => setEditing(false)} />
      </article>
    );
  }
  return (
    <article className="card">
      <div className="card-head">
        <h3>{tool.name}</h3>
        <AvailabilityBadge availability={tool.availability} />
      </div>
      <p className="meta"><span className="tag">{category}</span> · {condition}
        {tool.pendingRequests > 0 && <> · {tool.pendingRequests} pending request(s)</>}</p>
      <div className="row">
        <button className="btn" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn danger" onClick={() => confirm("Delete this listing?") && remove.run({ toolId: tool.id })}>
          Delete
        </button>
      </div>
      <ErrorText message={remove.error} />
    </article>
  );
}
