// Liveness probe for the container health check and the reverse proxy.
// It does not call Convex or Clerk, so a managed-service outage doesn't restart the app.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
