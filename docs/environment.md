# Environment variables

Secrets live in two places, none of them in git: `.env` (the one dev file) and the
Convex deployment environment (`npx convex env set`). Production uses `.env.production`.
Workflow JSON only references `$env.*`; `n8n/build.mjs` refuses to write a file that looks
like it contains a secret.

## Next.js (`.env`, read by Next.js)
| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex client URL (written by `npx convex dev`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk server key, used by `src/proxy.ts` |

## Convex deployment
| Name | Purpose |
|---|---|
| `CLERK_JWT_ISSUER_DOMAIN` | Issuer Convex trusts for Clerk JWTs (`convex/auth.config.ts`) |
| `LENDLOOP_WEBHOOK_SECRET` | Shared HMAC secret, both directions |
| `N8N_NOTIFY_WEBHOOK_URL` | Production URL of the "loan notifications" webhook |

If the n8n variables are missing, deliveries fail permanently with a clear error that shows
on the admin page. They are never silently skipped.

## n8n (`.env`, passed by Docker Compose)
| Name | Purpose |
|---|---|
| `N8N_ENCRYPTION_KEY` | Encrypts n8n credentials at rest. Keep it stable |
| `LENDLOOP_WEBHOOK_SECRET` | Same value as in Convex |
| `CONVEX_SITE_URL` | Convex HTTP actions base URL (`https://<name>.convex.site`) |
| `WEBHOOK_URL` | Public base URL n8n uses for webhooks |

Set in `docker-compose.yml` (not secret): `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` so Code
nodes can read the variables above, `NODE_FUNCTION_ALLOW_BUILTIN=crypto` (nothing else
can be required), and `CODE_ENABLE_STDOUT=true` so mock notifications reach the logs.

If you add a real email or Slack node, store its credentials as an **n8n credential**
(encrypted with `N8N_ENCRYPTION_KEY`), not in a node parameter.
