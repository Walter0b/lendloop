"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { timeAgo } from "@/shared/time";

export function HealthPanel() {
  const health = useQuery(api.automation.failures.health);
  if (!health) return <p className="muted">Loading automation health...</p>;
  const { failedRuns, failedDeliveries } = health;
  if (failedRuns.length + failedDeliveries.length === 0) {
    return <p className="ok-text">All automations healthy. No failed runs or deliveries.</p>;
  }
  return (
    <ul className="activity">
      {failedRuns.map((r) => (
        <li key={r.id} className="activity-error">
          n8n run failed: {r.workflow} at {r.node}: {r.message} <span className="muted">· {timeAgo(r.at)}</span>
        </li>
      ))}
      {failedDeliveries.map((d) => (
        <li key={d.id} className="activity-error">
          Delivery gave up: {d.type} ({d.error}) <span className="muted">· {timeAgo(d.at)}</span>
        </li>
      ))}
    </ul>
  );
}
