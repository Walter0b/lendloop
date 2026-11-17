# Local setup

Prerequisites: Node 20+, Docker, a free Clerk account, a free Convex account (or the
self-hosted Convex in `docker-compose.yml`).

## 1. Clerk
1. Create a Clerk application (email or Google sign-in).
2. In Clerk, enable the **Convex** integration (or create a JWT template named `convex`).
3. Copy the publishable and secret keys into `.env`, and note the Frontend API URL
   (the issuer, e.g. `https://xxx.clerk.accounts.dev`).

## 2. Convex
```bash
npx convex dev                                         # creates a deployment, writes .env
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://xxx.clerk.accounts.dev
npx convex env set LENDLOOP_WEBHOOK_SECRET "$(openssl rand -hex 32)"
npx convex env set N8N_NOTIFY_WEBHOOK_URL https://<public-n8n>/webhook/lendloop/loan-event
```
Run `npm run dev`, sign in once at http://localhost:3000, then make yourself admin:
```bash
npx convex run identity/admin:setRole '{"email":"you@example.com","role":"admin"}'
```
`setRole` is an internal function, so only someone with deployment access can run it.

## 3. n8n
```bash
# Fill the n8n section of .env (same LENDLOOP_WEBHOOK_SECRET as Convex)
docker compose run --rm n8n-setup   # imports and publishes the 3 workflows
docker compose up -d n8n            # UI on http://localhost:5678
```
Convex Cloud cannot reach `localhost`, so expose n8n with the tunnel profile:
`docker compose --profile tunnel up -d tunnel`, read the URL from
`docker compose logs tunnel`, and use it for `N8N_NOTIFY_WEBHOOK_URL` and `WEBHOOK_URL` in `.env`.
Set `CONVEX_SITE_URL` in `.env` to your `https://<name>.convex.site` URL.

**Fully local alternative:** `docker compose --profile convex up -d convex` runs a
self-hosted Convex. Then the services talk over the compose network:
`N8N_NOTIFY_WEBHOOK_URL=http://n8n:5678/webhook/lendloop/loan-event` and
`CONVEX_SITE_URL=http://convex:3211`. See [environment.md](environment.md).

## 4. Try it
- Mock notifications appear in `docker compose logs -f n8n` (`[LendLoop notify]`).
- `LENDLOOP_WEBHOOK_SECRET=... node scripts/send-test-event.mjs` sends a signed fake event;
  add `--bad-signature` to see the 401.
- Run "LendLoop: overdue reminders" from the n8n UI instead of waiting for 08:00.
- A borrower email ending in `@fail.test` makes the mock fail, to exercise error handling.
