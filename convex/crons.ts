import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("flag silent n8n runs", { minutes: 15 }, internal.automation.watchdog.flagSilentRuns, {});

export default crons;
