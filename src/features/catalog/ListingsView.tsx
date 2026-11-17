"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ListingRow } from "./ListingRow";
import { ToolForm } from "./ToolForm";

export function ListingsView() {
  const tools = useQuery(api.catalog.queries.myListings);
  const create = useMutation(api.catalog.mutations.create);
  return (
    <>
      <h1>My listings</h1>
      <section className="card">
        <h2>Lend something</h2>
        <ToolForm submitLabel="List tool" onSubmit={create} />
      </section>
      {tools?.length === 0 && <p className="muted">You have not listed anything yet.</p>}
      <div className="grid">{tools?.map((t) => <ListingRow key={t.id} tool={t} />)}</div>
    </>
  );
}
