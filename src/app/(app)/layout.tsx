import type { ReactNode } from "react";
import { AppShell } from "@/features/identity/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
