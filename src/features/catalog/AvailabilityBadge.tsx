import { Badge } from "@/shared/ui/Badge";
import { formatDay } from "@/shared/time";
import type { ToolView } from "./types";

export function AvailabilityBadge({ availability }: { availability: ToolView["availability"] }) {
  if (availability.state === "available") return <Badge tone="ok">Available</Badge>;
  return <Badge tone="warn">On loan until {formatDay(availability.until)}</Badge>;
}
