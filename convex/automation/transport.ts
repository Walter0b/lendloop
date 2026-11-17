import { HEADERS, sign } from "./domain/signature";

export type PostResult = { ok: boolean; status: number | null; error?: string };

const TIMEOUT_MS = 10_000;

export async function postSigned(url: string, secret: string, payload: unknown): Promise<PostResult> {
  const payloadText = JSON.stringify(payload);
  const { timestamp, signature } = await sign(secret, payloadText, Date.now());
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        [HEADERS.timestamp]: timestamp,
        [HEADERS.signature]: signature,
      },
      body: JSON.stringify({ payload: payloadText }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.ok ? { ok: true, status: res.status } : { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, status: null, error: err instanceof Error ? err.message : "network error" };
  }
}
