"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@convex/_generated/api";

const REJECTED = "You are signed in, but the server did not accept the session. Try reloading the page.";
const FAILED = "We could not load your account. Try reloading the page.";

export function useEnsureUser(): { ready: boolean; error: string | null } {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const store = useMutation(api.identity.users.store);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let live = true;
    store({})
      .then(() => live && setReady(true))
      .catch((err: unknown) => {
        console.error("[LendLoop] identity/users:store failed", err);
        if (live) setError(FAILED);
      });
    return () => {
      live = false;
    };
  }, [isAuthenticated, store]);

  // Usually a missing "convex" JWT template in Clerk.
  if (!isLoading && !isAuthenticated) return { ready: false, error: REJECTED };
  return { ready, error };
}
