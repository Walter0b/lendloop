// Usage: LENDLOOP_WEBHOOK_SECRET=... node scripts/send-test-event.mjs [url] [--bad-signature]
import { createHmac, randomUUID } from "node:crypto";

const url = process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:5678/webhook/lendloop/loan-event";
const secret = process.env.LENDLOOP_WEBHOOK_SECRET;
if (!secret) throw new Error("Set LENDLOOP_WEBHOOK_SECRET");

const payload = JSON.stringify({
  version: 1,
  kind: "loan-event",
  eventId: process.env.EVENT_ID ?? randomUUID(),
  type: "loan.requested",
  occurredAt: new Date().toISOString(),
  recipient: { firstName: "Ama", email: process.env.TO ?? "ama@example.test", role: "lender" },
  loan: { toolName: "Cordless drill", startDate: "2026-11-20", endDate: "2026-11-22", counterpartFirstName: "Kofi" },
});
const timestamp = String(Math.floor(Date.now() / 1000));
const key = process.argv.includes("--bad-signature") ? "wrong-secret" : secret;
const signature = `v1=${createHmac("sha256", key).update(`${timestamp}.${payload}`).digest("hex")}`;

const res = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json", "x-lendloop-timestamp": timestamp, "x-lendloop-signature": signature },
  body: JSON.stringify({ payload }),
});
console.log(res.status, await res.text());
