"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Badge } from "@/shared/ui/Badge";
import { ErrorText } from "@/shared/ui/ErrorText";
import { useSubmit } from "@/shared/useSubmit";
import { RequestForm } from "@/features/lending/RequestForm";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { ToolView } from "./types";

export function ToolCard({ tool, isAdmin }: { tool: ToolView; isAdmin: boolean }) {
  const [requesting, setRequesting] = useState(false);
  const remove = useSubmit(useMutation(api.catalog.mutations.remove));
  const warning = "Pending requests are declined and booked loans cancelled. Borrowers are notified.";
  const confirmRemove = () =>
    confirm(`Remove "${tool.name}" from the board? ${warning}`) && remove.run({ toolId: tool.id });
  return (
    <article className="card">
      <div className="card-head">
        <h3>{tool.name}</h3>
        <AvailabilityBadge availability={tool.availability} />
      </div>
      <p className="meta">
        <span className="tag">{tool.category}</span> · {tool.condition} · lent by {tool.mine ? "you" : tool.owner.name}
        {tool.owner.trusted && <> <Badge tone="info">Trusted Lender</Badge></>}
      </p>
      {tool.description && <p>{tool.description}</p>}
      <div className="row">
        {!tool.mine && !requesting && (
          <button className="btn primary" onClick={() => setRequesting(true)}>Request to borrow</button>
        )}
        {isAdmin && !tool.mine && <button className="btn danger" onClick={confirmRemove}>Remove listing</button>}
      </div>
      {requesting && <RequestForm toolId={tool.id} onDone={() => setRequesting(false)} />}
      <ErrorText message={remove.error} />
    </article>
  );
}
