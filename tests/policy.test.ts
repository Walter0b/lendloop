import { describe, expect, it } from "vitest";
import { canEditTool, canRemoveTool } from "../convex/catalog/domain/policy";
import { availableActions } from "../convex/lending/domain/actions";
import { loanPolicy } from "../convex/lending/domain/policy";
import type { Viewer } from "../convex/identity/domain/viewer";

const lender: Viewer = { id: "u1", role: "user" };
const borrower: Viewer = { id: "u2", role: "user" };
const stranger: Viewer = { id: "u3", role: "user" };
const admin: Viewer = { id: "u9", role: "admin" };
const loan = { lenderId: "u1", borrowerId: "u2", status: "requested" as const, startDate: "2026-11-20" };

describe("listing rules", () => {
  it("only owners edit; owners and admins remove", () => {
    expect(canEditTool(lender, { ownerId: "u1" })).toBe(true);
    expect(canEditTool(admin, { ownerId: "u1" })).toBe(false);
    expect(canRemoveTool(admin, { ownerId: "u1" })).toBe(true);
    expect(canRemoveTool(stranger, { ownerId: "u1" })).toBe(false);
  });
});

describe("loan rules", () => {
  it("nobody borrows their own tool", () => {
    expect(loanPolicy.request(lender, { ownerId: "u1" })).toBe(false);
  });

  it("gives each party only their own actions", () => {
    expect(availableActions(lender, loan, "2026-11-16")).toEqual(["approve", "decline"]);
    expect(availableActions(borrower, loan, "2026-11-16")).toEqual(["cancel"]);
    expect(availableActions(stranger, loan, "2026-11-16")).toEqual([]);
    expect(availableActions(admin, loan, "2026-11-16")).toEqual([]);
  });

  it("before a loan starts, either party can cancel; once started, only return", () => {
    const booked = { ...loan, status: "approved" as const };
    expect(availableActions(lender, booked, "2026-11-16")).toEqual(["cancel"]);
    expect(availableActions(borrower, booked, "2026-11-16")).toEqual(["cancel"]);
    const active = { ...booked, startDate: "2026-11-10" };
    expect(availableActions(lender, active, "2026-11-16")).toEqual(["markReturned"]);
    expect(availableActions(borrower, active, "2026-11-16")).toEqual([]);
  });

  it("admins can view any loan but act on none", () => {
    expect(loanPolicy.view(admin, loan)).toBe(true);
    expect(loanPolicy.view(stranger, loan)).toBe(false);
  });
});
