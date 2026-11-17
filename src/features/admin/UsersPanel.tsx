"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Badge } from "@/shared/ui/Badge";

export function UsersPanel() {
  const users = useQuery(api.identity.admin.listUsers);
  const setTrusted = useMutation(api.identity.admin.setTrustedLender);
  if (!users) return <p className="muted">Loading users...</p>;
  return (
    <table className="table">
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Trusted Lender</th></tr></thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td className="muted">{u.email}</td>
            <td><Badge tone={u.role === "admin" ? "info" : "neutral"}>{u.role}</Badge></td>
            <td>
              <label className="toggle">
                <input type="checkbox" checked={u.trustedLender}
                  onChange={(e) => setTrusted({ userId: u.id, trusted: e.target.checked })} />
                {u.trustedLender ? "Trusted" : "Not yet"}
              </label>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
