import { defineSchema } from "convex/server";
import { users } from "./identity/table";
import { tools } from "./catalog/table";
import { loans } from "./lending/table";
import { activity, failures, outbox, reminders } from "./automation/tables";

export default defineSchema({ users, tools, loans, outbox, activity, reminders, failures });
