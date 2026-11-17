import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import type { NotificationPayload } from "./domain/payload";
import { postSigned, type PostResult } from "./transport";

export const deliver = internalAction({
  args: { outboxId: v.id("outbox") },
  handler: async (ctx, { outboxId }) => {
    const job = await ctx.runQuery(internal.automation.deliveryState.load, { outboxId });
    if (!job || job.status !== "pending") return;
    const result = await send(job.payload);
    await ctx.runMutation(internal.automation.deliveryState.recordAttempt, {
      outboxId,
      ok: result.ok,
      httpStatus: result.status ?? undefined,
      error: result.error,
    });
  },
});

async function send(payload: NotificationPayload | null): Promise<PostResult> {
  const url = process.env.N8N_NOTIFY_WEBHOOK_URL;
  const secret = process.env.LENDLOOP_WEBHOOK_SECRET;
  if (!url || !secret) {
    return { ok: false, status: 400, error: "N8N_NOTIFY_WEBHOOK_URL or LENDLOOP_WEBHOOK_SECRET not set" };
  }
  if (!payload) return { ok: false, status: 400, error: "Loan data no longer exists" };
  return postSigned(url, secret, payload);
}
