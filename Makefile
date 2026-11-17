SHELL := /bin/sh
.DEFAULT_GOAL := help

# make <target> ENV=staging uses .env.staging and its own secrets directory
ENV ?= production
ENV_FILE ?= .env.$(ENV)
export ENV_FILE
COMPOSE := ./deploy/compose.sh
env_value = $(shell sed -n 's/^$(1)=//p' $(ENV_FILE) 2>/dev/null | tail -n 1)
IMAGE ?= lendloop:local

# Also: init, build, health, n8n-deploy, backup, restore, convex-*, release, rollback, n8n-editor
include deploy/ops.mk

.PHONY: help guard config check up down ps logs

help: ## List targets
	@awk 'BEGIN {FS = ":.*## "} /^[a-z0-9-]+:.*## / {printf "  %-14s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo "  Add ENV=staging to target the staging stack."

guard:
	@./scripts/validate-production-env.sh $(ENV_FILE)

config: guard ## Validate the env file and the merged Compose config
	@$(COMPOSE) config --quiet && echo "compose config ok ($(ENV_FILE))"

check: ## Tests, types, file size, workflow export drift, shell lint
	@before=$$(cat n8n/workflows/*.json | shasum); npm run n8n:build; \
	[ "$$before" = "$$(cat n8n/workflows/*.json | shasum)" ] || \
	  (echo "n8n/workflows was stale and has been rebuilt: review and commit it"; exit 1)
	npm test
	npm run typecheck
	npm run lint:size
	@if command -v shellcheck >/dev/null; then shellcheck deploy/*.sh scripts/*.sh n8n/setup.sh; \
	else echo "shellcheck not installed, skipped"; fi

up: config ## Start the stack and wait for health checks
	$(COMPOSE) up -d --remove-orphans --wait --wait-timeout 240

down: guard ## Stop containers (volumes are kept)
	$(COMPOSE) down

ps: guard ## Container status
	$(COMPOSE) ps

logs: guard ## Follow logs (SERVICE=n8n to filter)
	$(COMPOSE) logs -f --tail=100 $(SERVICE)
