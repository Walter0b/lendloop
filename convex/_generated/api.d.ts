/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as automation_activity from "../automation/activity.js";
import type * as automation_delivery from "../automation/delivery.js";
import type * as automation_deliveryState from "../automation/deliveryState.js";
import type * as automation_domain_events from "../automation/domain/events.js";
import type * as automation_domain_payload from "../automation/domain/payload.js";
import type * as automation_domain_retry from "../automation/domain/retry.js";
import type * as automation_domain_signature from "../automation/domain/signature.js";
import type * as automation_failures from "../automation/failures.js";
import type * as automation_http_routes from "../automation/http/routes.js";
import type * as automation_http_signedRoute from "../automation/http/signedRoute.js";
import type * as automation_outbox from "../automation/outbox.js";
import type * as automation_overdue from "../automation/overdue.js";
import type * as automation_payloadBuilder from "../automation/payloadBuilder.js";
import type * as automation_tables from "../automation/tables.js";
import type * as automation_transport from "../automation/transport.js";
import type * as automation_watchdog from "../automation/watchdog.js";
import type * as automation_writeBacks from "../automation/writeBacks.js";
import type * as catalog_domain_policy from "../catalog/domain/policy.js";
import type * as catalog_domain_tool from "../catalog/domain/tool.js";
import type * as catalog_mutations from "../catalog/mutations.js";
import type * as catalog_publicQueries from "../catalog/publicQueries.js";
import type * as catalog_queries from "../catalog/queries.js";
import type * as catalog_table from "../catalog/table.js";
import type * as crons from "../crons.js";
import type * as dev_seed from "../dev/seed.js";
import type * as http from "../http.js";
import type * as identity_admin from "../identity/admin.js";
import type * as identity_domain_viewer from "../identity/domain/viewer.js";
import type * as identity_table from "../identity/table.js";
import type * as identity_users from "../identity/users.js";
import type * as lending_closure from "../lending/closure.js";
import type * as lending_decisions from "../lending/decisions.js";
import type * as lending_domain_actions from "../lending/domain/actions.js";
import type * as lending_domain_availability from "../lending/domain/availability.js";
import type * as lending_domain_dates from "../lending/domain/dates.js";
import type * as lending_domain_policy from "../lending/domain/policy.js";
import type * as lending_domain_status from "../lending/domain/status.js";
import type * as lending_queries from "../lending/queries.js";
import type * as lending_read from "../lending/read.js";
import type * as lending_requests from "../lending/requests.js";
import type * as lending_service from "../lending/service.js";
import type * as lending_table from "../lending/table.js";
import type * as lending_views from "../lending/views.js";
import type * as shared_errors from "../shared/errors.js";
import type * as shared_functions from "../shared/functions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "automation/activity": typeof automation_activity;
  "automation/delivery": typeof automation_delivery;
  "automation/deliveryState": typeof automation_deliveryState;
  "automation/domain/events": typeof automation_domain_events;
  "automation/domain/payload": typeof automation_domain_payload;
  "automation/domain/retry": typeof automation_domain_retry;
  "automation/domain/signature": typeof automation_domain_signature;
  "automation/failures": typeof automation_failures;
  "automation/http/routes": typeof automation_http_routes;
  "automation/http/signedRoute": typeof automation_http_signedRoute;
  "automation/outbox": typeof automation_outbox;
  "automation/overdue": typeof automation_overdue;
  "automation/payloadBuilder": typeof automation_payloadBuilder;
  "automation/tables": typeof automation_tables;
  "automation/transport": typeof automation_transport;
  "automation/watchdog": typeof automation_watchdog;
  "automation/writeBacks": typeof automation_writeBacks;
  "catalog/domain/policy": typeof catalog_domain_policy;
  "catalog/domain/tool": typeof catalog_domain_tool;
  "catalog/mutations": typeof catalog_mutations;
  "catalog/publicQueries": typeof catalog_publicQueries;
  "catalog/queries": typeof catalog_queries;
  "catalog/table": typeof catalog_table;
  crons: typeof crons;
  "dev/seed": typeof dev_seed;
  http: typeof http;
  "identity/admin": typeof identity_admin;
  "identity/domain/viewer": typeof identity_domain_viewer;
  "identity/table": typeof identity_table;
  "identity/users": typeof identity_users;
  "lending/closure": typeof lending_closure;
  "lending/decisions": typeof lending_decisions;
  "lending/domain/actions": typeof lending_domain_actions;
  "lending/domain/availability": typeof lending_domain_availability;
  "lending/domain/dates": typeof lending_domain_dates;
  "lending/domain/policy": typeof lending_domain_policy;
  "lending/domain/status": typeof lending_domain_status;
  "lending/queries": typeof lending_queries;
  "lending/read": typeof lending_read;
  "lending/requests": typeof lending_requests;
  "lending/service": typeof lending_service;
  "lending/table": typeof lending_table;
  "lending/views": typeof lending_views;
  "shared/errors": typeof shared_errors;
  "shared/functions": typeof shared_functions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
