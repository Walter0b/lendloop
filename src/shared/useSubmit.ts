"use client";

import { ConvexError } from "convex/values";
import { useState } from "react";

export function useSubmit<A extends unknown[]>(fn: (...args: A) => Promise<unknown>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(...args: A): Promise<boolean> {
    setPending(true);
    setError(null);
    try {
      await fn(...args);
      return true;
    } catch (err) {
      const data = err instanceof ConvexError ? (err.data as { message?: string }) : null;
      setError(data?.message ?? "Something went wrong. Please try again.");
      return false;
    } finally {
      setPending(false);
    }
  }

  return { run, pending, error };
}
