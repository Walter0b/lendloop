# Operational targets, included by the Makefile. Run from the project root.
.PHONY: init build health n8n-deploy backup restore convex-env convex-deploy release rollback n8n-editor

init: ## Create the env file and random secret files for ENV
	@test -f $(ENV_FILE) || cp $(ENV_FILE).example $(ENV_FILE)
	@chmod 600 $(ENV_FILE)
	@dir=$$(sed -n 's/^SECRETS_DIR=//p' $(ENV_FILE) | tail -n 1); dir=$${dir:-./secrets}; \
	umask 077; mkdir -p "$$dir"; \
	test -s "$$dir/postgres_password" || openssl rand -hex 32 > "$$dir/postgres_password"; \
	test -s "$$dir/n8n_encryption_key" || openssl rand -hex 32 > "$$dir/n8n_encryption_key"; \
	echo "Secrets in $$dir. Edit $(ENV_FILE), then run: make config ENV=$(ENV)"

build: ## Build the app image locally (IMAGE=lendloop:local)
	docker build \
	  --build-arg NEXT_PUBLIC_CONVEX_URL="$(call env_value,NEXT_PUBLIC_CONVEX_URL)" \
	  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$(call env_value,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)" \
	  -t $(IMAGE) .

health: guard ## Fail unless every service is healthy
	@./deploy/health.sh

n8n-deploy: guard ## Import and publish n8n/workflows, then restart n8n
	$(COMPOSE) run --rm n8n-setup
	$(COMPOSE) restart n8n n8n-worker
	$(COMPOSE) up -d --wait --wait-timeout 180 n8n n8n-worker

backup: guard ## Dump n8n PostgreSQL to backups/ (KEEP_DAYS=14)
	@./deploy/backup.sh $(or $(KEEP_DAYS),14)

restore: guard ## Restore a dump: make restore FILE=backups/n8n-....dump
	@test -n "$(FILE)" || (echo "Usage: make restore FILE=backups/n8n-<stamp>.dump"; exit 1)
	@./deploy/restore.sh $(FILE)

convex-env: guard ## Push Clerk issuer, HMAC secret and n8n URL to Convex (needs CONVEX_DEPLOY_KEY)
	@./scripts/configure-convex-production.sh $(ENV_FILE)

convex-deploy: ## Push Convex functions and schema (needs CONVEX_DEPLOY_KEY)
	@test -n "$$CONVEX_DEPLOY_KEY" || (echo "Export CONVEX_DEPLOY_KEY first"; exit 1)
	npx convex deploy

release: ## Roll out IMAGE with auto-rollback: make release IMAGE=ghcr.io/owner/lendloop:<sha>
	@case "$(IMAGE)" in *:local) echo "Usage: make release IMAGE=ghcr.io/owner/lendloop:<sha>"; exit 1;; esac
	./deploy/release.sh $(IMAGE)

rollback: ## Same as release, with an older image tag
	@case "$(IMAGE)" in *:local) echo "Usage: make rollback IMAGE=ghcr.io/owner/lendloop:<older sha>"; exit 1;; esac
	./deploy/release.sh $(IMAGE)

n8n-editor: ## How to reach the n8n editor (never public)
	@p=$(or $(call env_value,N8N_EDITOR_PORT),5678); echo "ssh -L $$p:127.0.0.1:$$p <server>, then open http://localhost:$$p"
