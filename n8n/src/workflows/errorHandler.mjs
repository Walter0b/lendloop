import { connections, n } from "../nodes.mjs";
import { IDS, settings } from "./ids.mjs";

export default {
  id: IDS.errors,
  name: "LendLoop: error handler",
  active: true,
  settings: settings(false),
  nodes: [
    { name: "On workflow error", type: "n8n-nodes-base.errorTrigger", typeVersion: 1, position: [0, 0], parameters: {} },
    n.code("Build failure report", "failure-report.js", [220, 0]),
    n.code("Sign report", "sign-envelope.js", [440, 0], { perItem: true }),
    n.convexPost("Report to Convex", "/automation/failures", [660, 0]),
  ],
  connections: connections({
    "On workflow error": ["Build failure report"],
    "Build failure report": ["Sign report"],
    "Sign report": ["Report to Convex"],
  }),
};
