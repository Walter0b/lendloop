"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useMe } from "@/features/identity/useMe";
import { LoanList } from "@/features/lending/LoanList";
import { HealthPanel } from "./HealthPanel";
import { UsersPanel } from "./UsersPanel";

export function AdminView() {
  const me = useMe();
  const isAdmin = me?.role === "admin";
  const loans = useQuery(api.lending.queries.all, isAdmin ? {} : "skip");
  if (!isAdmin) return <p className="muted">This page is for admins.</p>;
  return (
    <>
      <h1>Admin</h1>
      <section className="section"><h2>Automation health</h2><HealthPanel /></section>
      <section className="section"><h2>Neighbours</h2><UsersPanel /></section>
      <section className="section">
        <h2>All loans</h2>
        <LoanList loans={loans} perspective="admin" empty="No loans yet." />
      </section>
    </>
  );
}
