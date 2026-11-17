import { writeFileSync } from "node:fs";
import errorHandler from "./src/workflows/errorHandler.mjs";
import loanNotifications from "./src/workflows/loanNotifications.mjs";
import overdueReminders from "./src/workflows/overdueReminders.mjs";

const files = {
  "loan-notifications.json": loanNotifications,
  "overdue-reminders.json": overdueReminders,
  "error-handler.json": errorHandler,
};

for (const [file, workflow] of Object.entries(files)) {
  const json = JSON.stringify({ ...workflow, pinData: {}, tags: [] }, null, 2);
  if (/whsec|sk_live|sk_test|LENDLOOP_WEBHOOK_SECRET\s*[:=]\s*["'][^$]/.test(json)) {
    throw new Error(`${file} looks like it contains a secret`);
  }
  writeFileSync(new URL(`./workflows/${file}`, import.meta.url), `${json}\n`);
  console.log(`wrote n8n/workflows/${file}`);
}
