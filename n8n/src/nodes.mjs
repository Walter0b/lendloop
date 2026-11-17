import { readFileSync } from "node:fs";

const code = (file) => readFileSync(new URL(`./code/${file}`, import.meta.url), "utf8");
const RETRY = { retryOnFail: true, maxTries: 3, waitBetweenTries: 5000 };

export const n = {
  code: (name, file, pos, extra = {}) => ({
    name, type: "n8n-nodes-base.code", typeVersion: 2, position: pos,
    parameters: { mode: extra.perItem ? "runOnceForEachItem" : "runOnceForAllItems", jsCode: code(file) },
    ...(extra.onError ? { onError: extra.onError } : {}),
    ...(extra.retry ? RETRY : {}),
  }),
  convexPost: (name, path, pos) => ({
    name, type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: pos, ...RETRY,
    parameters: {
      method: "POST",
      url: `={{ $env.CONVEX_SITE_URL }}${path}`,
      sendHeaders: true,
      headerParameters: { parameters: [
        { name: "x-lendloop-timestamp", value: "={{ $json.signed.timestamp }}" },
        { name: "x-lendloop-signature", value: "={{ $json.signed.signature }}" },
      ] },
      sendBody: true,
      specifyBody: "json",
      jsonBody: "={{ JSON.stringify({ payload: $json.signed.payload }) }}",
      options: { timeout: 10000 },
    },
  }),
  respond: (name, status, body, pos) => ({
    name, type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.1, position: pos,
    parameters: { respondWith: "json", responseBody: body, options: { responseCode: status } },
  }),
};

// connections({ A: ["B"], C: [["ok"], ["err"]] })
export function connections(map) {
  const out = {};
  for (const [from, targets] of Object.entries(map)) {
    const outputs = Array.isArray(targets[0]) ? targets : [targets];
    out[from] = { main: outputs.map((list) => list.map((node) => ({ node, type: "main", index: 0 }))) };
  }
  return out;
}
