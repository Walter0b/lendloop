import { connections, n } from "../nodes.mjs";
import { IDS, settings } from "./ids.mjs";

const isValid = {
  conditions: {
    options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
    combinator: "and",
    conditions: [{
      id: "valid-signature", leftValue: "={{ $json.valid }}", rightValue: true,
      operator: { type: "boolean", operation: "true", singleValue: true },
    }],
  },
  options: {},
};

export default {
  id: IDS.notifications,
  name: "LendLoop: loan notifications",
  active: true,
  settings: settings(),
  nodes: [
    {
      name: "Loan event webhook", type: "n8n-nodes-base.webhook", typeVersion: 2, position: [0, 0],
      webhookId: "6f1c2b7e-1d55-4c4e-9a43-1f2d7b9c0a11",
      parameters: { httpMethod: "POST", path: "lendloop/loan-event", responseMode: "responseNode", options: {} },
    },
    n.code("Verify signature", "verify-signature.js", [220, 0]),
    { name: "Signature valid?", type: "n8n-nodes-base.if", typeVersion: 2, position: [440, 0], parameters: isValid },
    n.respond("Accept (202)", 202, '={{ { "accepted": true } }}', [660, -100]),
    n.respond("Reject (401)", 401, '={{ { "error": $json.reason } }}', [660, 100]),
    n.code("Notify recipient", "notify-recipient.js", [880, -100], { perItem: true, retry: true, onError: "continueErrorOutput" }),
    n.code("Notification failed", "notification-failed.js", [1100, 0], { perItem: true }),
    n.code("Sign write-back", "sign-envelope.js", [1320, -100], { perItem: true }),
    n.convexPost("Write status to Convex", "/automation/notifications", [1540, -100]),
  ],
  connections: connections({
    "Loan event webhook": ["Verify signature"],
    "Verify signature": ["Signature valid?"],
    "Signature valid?": [["Accept (202)"], ["Reject (401)"]],
    "Accept (202)": ["Notify recipient"],
    "Notify recipient": [["Sign write-back"], ["Notification failed"]],
    "Notification failed": ["Sign write-back"],
    "Sign write-back": ["Write status to Convex"],
  }),
};
