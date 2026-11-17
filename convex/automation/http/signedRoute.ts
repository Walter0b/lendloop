import { httpAction, type ActionCtx } from "../../_generated/server";
import { HEADERS, verify } from "../domain/signature";

type Handler = (ctx: ActionCtx, body: Record<string, unknown>) => Promise<unknown>;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export function signedRoute(expectedType: string, handler: Handler) {
  return httpAction(async (ctx, request) => {
    const secret = process.env.LENDLOOP_WEBHOOK_SECRET;
    if (!secret) return json(503, { error: "not_configured" });
    let envelope: { payload?: unknown };
    try {
      envelope = await request.json();
    } catch {
      return json(400, { error: "bad_json" });
    }
    if (typeof envelope.payload !== "string") return json(400, { error: "missing_payload" });
    const verdict = await verify(secret, {
      timestamp: request.headers.get(HEADERS.timestamp),
      signature: request.headers.get(HEADERS.signature),
      body: envelope.payload,
    }, Date.now());
    if (verdict !== "ok") return json(401, { error: verdict });
    const { type, ...body } = JSON.parse(envelope.payload) as Record<string, unknown>;
    if (type !== expectedType) return json(400, { error: "wrong_type" });
    try {
      return json(200, await handler(ctx, body));
    } catch (err) {
      console.error(`[${expectedType}]`, err);
      return json(400, { error: "rejected" });
    }
  });
}
