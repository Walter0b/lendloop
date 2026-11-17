import { describe, expect, it } from "vitest";
import { assertTransition, canTransition } from "../convex/lending/domain/status";

describe("loan lifecycle", () => {
  it("allows the happy path", () => {
    expect(canTransition("requested", "approved")).toBe(true);
    expect(canTransition("approved", "returned")).toBe(true);
  });

  it("rejects moves out of final states", () => {
    for (const final of ["declined", "cancelled", "returned"] as const) {
      expect(canTransition(final, "approved")).toBe(false);
    }
  });

  it("cannot return something that was never approved", () => {
    expect(() => assertTransition("requested", "returned")).toThrow(/from requested to returned/);
  });
});
