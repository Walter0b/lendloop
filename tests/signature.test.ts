import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { sign, verify } from "../convex/automation/domain/signature";

const secret = "test-secret";
const body = JSON.stringify({ type: "reminder.result", reminderKey: "abc:2026-11-16", status: "sent" });
const now = Date.parse("2026-11-16T08:00:00Z");

describe("HMAC envelope", () => {
  it("round-trips", async () => {
    const s = await sign(secret, body, now);
    expect(await verify(secret, { ...s, body }, now)).toBe("ok");
  });

  it("matches what the n8n Code node computes with node:crypto", async () => {
    const { timestamp, signature } = await sign(secret, body, now);
    const n8n = `v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
    expect(signature).toBe(n8n);
  });

  it("rejects tampering, wrong secrets, stale and missing headers", async () => {
    const s = await sign(secret, body, now);
    expect(await verify(secret, { ...s, body: body.replace("sent", "failed") }, now)).toBe("bad_signature");
    expect(await verify("other", { ...s, body }, now)).toBe("bad_signature");
    expect(await verify(secret, { ...s, body }, now + 301_000)).toBe("stale");
    expect(await verify(secret, { timestamp: null, signature: null, body }, now)).toBe("missing");
  });
});
