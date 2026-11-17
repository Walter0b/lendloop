import { httpRouter } from "convex/server";
import { notificationResult, overdueLoans, reminderResult, workflowFailure } from "./automation/http/routes";

const http = httpRouter();

http.route({ path: "/automation/overdue-loans", method: "POST", handler: overdueLoans });
http.route({ path: "/automation/reminders", method: "POST", handler: reminderResult });
http.route({ path: "/automation/notifications", method: "POST", handler: notificationResult });
http.route({ path: "/automation/failures", method: "POST", handler: workflowFailure });

export default http;
