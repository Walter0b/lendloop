import { defineTable } from "convex/server";
import { v } from "convex/values";
import { LOAN_EVENTS } from "./domain/events";

export const eventTypeValidator = v.union(...LOAN_EVENTS.map((e) => v.literal(e)));
const partyValidator = v.union(v.literal("lender"), v.literal("borrower"));

export const outbox = defineTable({
  eventId: v.string(),
  loanId: v.id("loans"),
  type: eventTypeValidator,
  recipient: v.optional(partyValidator), // optional for rows created before this field existed
  status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("notified"), v.literal("failed")),
  attempts: v.number(),
  lastError: v.optional(v.string()),
  acceptedAt: v.optional(v.number()),
})
  .index("by_event", ["eventId"])
  .index("by_status", ["status"]);

export const activity = defineTable({
  loanId: v.id("loans"),
  key: v.string(),
  message: v.string(),
  tone: v.union(v.literal("info"), v.literal("ok"), v.literal("error")),
})
  .index("by_loan", ["loanId"])
  .index("by_key", ["key"]);

export const reminders = defineTable({
  key: v.string(),
  loanId: v.id("loans"),
  status: v.union(v.literal("sent"), v.literal("failed")),
  detail: v.optional(v.string()),
}).index("by_key", ["key"]);

export const failures = defineTable({
  key: v.string(),
  workflow: v.string(),
  node: v.string(),
  message: v.string(),
}).index("by_key", ["key"]);
