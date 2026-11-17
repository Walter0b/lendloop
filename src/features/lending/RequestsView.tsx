"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { LoanList } from "./LoanList";

export function MyRequestsView() {
  const loans = useQuery(api.lending.queries.myRequests);
  return (
    <>
      <h1>My requests</h1>
      <LoanList loans={loans} perspective="borrower" empty="You have not asked to borrow anything yet." />
    </>
  );
}

export function IncomingView() {
  const loans = useQuery(api.lending.queries.incoming);
  return (
    <>
      <h1>Incoming requests</h1>
      <LoanList loans={loans} perspective="lender" empty="Nobody has asked for your tools yet." />
    </>
  );
}
