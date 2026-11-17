import { timeAgo } from "@/shared/time";

type Entry = { message: string; tone: "info" | "ok" | "error"; at: number };

export function ActivityList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null;
  return (
    <ul className="activity">
      {entries.map((e) => (
        <li key={`${e.at}-${e.message}`} className={`activity-${e.tone}`}>
          {e.message} <span className="muted">· {timeAgo(e.at)}</span>
        </li>
      ))}
    </ul>
  );
}
