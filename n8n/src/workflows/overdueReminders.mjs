import { connections, n } from "../nodes.mjs";
import { IDS, settings } from "./ids.mjs";

export default {
  id: IDS.overdue,
  name: "LendLoop: overdue reminders",
  active: true,
  settings: settings(),
  nodes: [
    {
      name: "Every day at 08:00", type: "n8n-nodes-base.scheduleTrigger", typeVersion: 1.2, position: [0, 0],
      parameters: { rule: { interval: [{ field: "days", daysInterval: 1, triggerAtHour: 8 }] } },
    },
    { name: "Run now", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, position: [0, 160], parameters: {} },
    n.code("Build overdue query", "overdue-query.js", [220, 0]),
    n.code("Sign query", "sign-envelope.js", [440, 0], { perItem: true }),
    n.convexPost("Fetch overdue loans", "/automation/overdue-loans", [660, 0]),
    n.code("One item per loan", "split-loans.js", [880, 0]),
    n.code("Send reminder", "send-reminder.js", [1100, 0], { perItem: true, retry: true, onError: "continueErrorOutput" }),
    n.code("Reminder failed", "reminder-failed.js", [1320, 120], { perItem: true }),
    n.code("Sign write-back", "sign-envelope.js", [1540, 0], { perItem: true }),
    n.convexPost("Write reminder status", "/automation/reminders", [1760, 0]),
  ],
  connections: connections({
    "Every day at 08:00": ["Build overdue query"],
    "Run now": ["Build overdue query"],
    "Build overdue query": ["Sign query"],
    "Sign query": ["Fetch overdue loans"],
    "Fetch overdue loans": ["One item per loan"],
    "One item per loan": ["Send reminder"],
    "Send reminder": [["Sign write-back"], ["Reminder failed"]],
    "Reminder failed": ["Sign write-back"],
    "Sign write-back": ["Write reminder status"],
  }),
};
