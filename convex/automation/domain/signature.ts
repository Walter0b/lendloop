// HMAC-SHA256 of `${timestamp}.${body}`, sent as `v1=<hex>`. Used in both directions.
export const HEADERS = { timestamp: "x-lendloop-timestamp", signature: "x-lendloop-signature" };
export const MAX_SKEW_SECONDS = 300;

const encoder = new TextEncoder();

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sign(secret: string, body: string, nowMs: number) {
  const timestamp = String(Math.floor(nowMs / 1000));
  return { timestamp, signature: `v1=${await hmacHex(secret, `${timestamp}.${body}`)}` };
}

export type Verdict = "ok" | "missing" | "stale" | "bad_signature";

type Signed = { timestamp: string | null; signature: string | null; body: string };

export async function verify(secret: string, req: Signed, nowMs: number): Promise<Verdict> {
  if (!req.timestamp || !req.signature) return "missing";
  const age = Math.abs(nowMs / 1000 - Number(req.timestamp));
  if (!Number.isFinite(age) || age > MAX_SKEW_SECONDS) return "stale";
  const expected = `v1=${await hmacHex(secret, `${req.timestamp}.${req.body}`)}`;
  return timingSafeEqual(expected, req.signature) ? "ok" : "bad_signature";
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
