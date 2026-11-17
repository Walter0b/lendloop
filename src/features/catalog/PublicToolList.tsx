"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function PublicToolList() {
  const tools = useQuery(api.catalog.publicQueries.listAvailable);
  if (tools === undefined) return <p className="muted">Loading tools...</p>;
  if (tools.length === 0) return <p className="muted">Nothing listed yet. Be the first to lend something.</p>;
  return (
    <ul className="chips">
      {tools.map((tool) => (
        <li key={tool.id} className="chip">
          <strong>{tool.name}</strong>
          <span className="tag">{tool.category}</span>
        </li>
      ))}
    </ul>
  );
}
