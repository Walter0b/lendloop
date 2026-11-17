"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useMe } from "@/features/identity/useMe";
import { CategoryFilter } from "./CategoryFilter";
import { ToolCard } from "./ToolCard";
import type { Category } from "./types";

export function BoardView() {
  const [category, setCategory] = useState<Category | undefined>();
  const tools = useQuery(api.catalog.queries.board, { category });
  const me = useMe();
  return (
    <>
      <h1>The board</h1>
      <CategoryFilter value={category} onChange={setCategory} />
      {tools === undefined && <p className="muted">Loading...</p>}
      {tools?.length === 0 && <p className="muted">No tools in this category yet.</p>}
      <div className="grid">
        {tools?.map((t) => <ToolCard key={t.id} tool={t} isAdmin={me?.role === "admin"} />)}
      </div>
    </>
  );
}
