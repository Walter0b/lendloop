"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { useEnsureUser } from "./useEnsureUser";
import { useMe } from "./useMe";
import { ErrorText } from "@/shared/ui/ErrorText";
import { Logo } from "@/shared/ui/Logo";

const LINKS = [
  { href: "/board", label: "Board" },
  { href: "/listings", label: "My listings" },
  { href: "/requests", label: "My requests" },
  { href: "/incoming", label: "Incoming requests" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, error } = useEnsureUser();
  const me = useMe();
  const path = usePathname();
  const links = me?.role === "admin" ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="brand"><Logo variant="wide" /></Link>
          <nav className="nav">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={path.startsWith(l.href) ? "active" : ""}>
                {l.label}
              </Link>
            ))}
          </nav>
          <UserButton />
        </div>
      </header>
      <main className="page">
        {error ? <ErrorText message={error} />
          : ready && me ? children : <p className="muted">Loading your neighbourhood...</p>}
      </main>
    </div>
  );
}
