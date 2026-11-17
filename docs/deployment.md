# Production deployment

Docker runs Next.js, n8n (main and a queue worker), PostgreSQL and Redis. Convex and Clerk stay
managed. TLS ends at the VPS's shared edge nginx ([deploy/nginx/](../deploy/nginx/)), which
reaches the app and the n8n webhooks over the `EDGE_NETWORK` Docker network. No container
publishes a public port; the n8n editor binds to `127.0.0.1` and is reached over SSH.

## First deployment (on the server)
```bash
make init                 # .env.production from the example, random secret files (mode 600)
# Fill .env.production. Images are pinned by tag and digest; APP_IMAGE is set by CI.
make config               # rejects placeholders, http URLs, short secrets, :latest images
export CONVEX_DEPLOY_KEY='...'   # production deploy key from the Convex dashboard
make convex-env           # Clerk issuer, HMAC secret, n8n webhook URL into Convex
```
Issue a certificate for the domain with certbot `--webroot`, then add
[deploy/nginx/lendloop.joram.app.conf](../deploy/nginx/lendloop.joram.app.conf) to the edge
nginx. After that, every push to `main` runs CI, pushes the image to GHCR, runs
`npx convex deploy`, then [deploy/release.sh](../deploy/release.sh) over SSH and a smoke test.
GitHub needs: secrets `CONVEX_DEPLOY_KEY`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`; variables
`APP_DOMAIN`, `DEPLOY_TARGET`, `DEPLOY_PATH`, `NEXT_PUBLIC_CONVEX_URL`,
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.

A release backs up n8n, imports and publishes the workflows, rolls out the image and waits for
its health check. If the new image is unhealthy it goes back to the previous one.

## Operations
`make help` lists everything. The common ones:
```bash
make health                    # fails unless every service is healthy
make ps / make logs SERVICE=n8n
make n8n-deploy                # import and publish n8n/workflows
make backup                    # pg_dump to backups/, keeps 14 days (KEEP_DAYS=n)
make restore FILE=backups/n8n-<stamp>.dump
make rollback IMAGE=ghcr.io/<owner>/lendloop:<older sha>
make n8n-editor                # SSH tunnel command for the editor
```
Add `ENV=staging` to any target to use `.env.staging`, `secrets/staging/` and its own Compose
project. Staging should point at a separate Convex deployment and Clerk instance.

## Backups
Copy `backups/` off the host (cron `make backup`, then rsync or restic). The dump holds n8n
credentials encrypted with `secrets/n8n_encryption_key`; without that file they cannot be
restored, so keep it, `.env.production` and `secrets/` in a password manager. Convex data is
backed up in the Convex dashboard. Never run `docker compose down --volumes` in production.

## Known gap
The workflows read `$env.LENDLOOP_WEBHOOK_SECRET` in Code nodes, so n8n env access stays on.
Database and encryption secrets are Docker secret files, not env values. Move HMAC signing to
an isolated signer before anyone untrusted can edit workflows.
