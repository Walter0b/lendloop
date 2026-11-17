export const ROLES = ["admin", "user"] as const;
export type Role = (typeof ROLES)[number];

export type Viewer = { id: string; role: Role };

export const isAdmin = (viewer: Viewer): boolean => viewer.role === "admin";

export function publicName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || "Neighbour";
}
