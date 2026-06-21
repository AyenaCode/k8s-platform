# K8s Lab: Docker is the only dependency. `make up`, then open the URL.

COMPOSE ?= docker compose
URL     ?= http://localhost:8088

.DEFAULT_GOAL := help
.PHONY: help up down logs ps shell reset clean release

help: ## Show this help
	@echo "K8s Lab: available commands:"
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN{FS=":.*## "}{printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Quick start:  make up   then open $(URL)"

up: ## Build + start the whole lab (k3s + postgres + app)
	$(COMPOSE) up -d --build
	@echo ""
	@echo "✓ Lab is starting (k3s takes ~30s on first boot). Open $(URL)"

down: ## Stop the lab (keeps your progress + cluster data)
	$(COMPOSE) down

clean: ## Stop and DELETE all volumes (cluster + progress wiped)
	$(COMPOSE) down -v

logs: ## Tail the app logs
	$(COMPOSE) logs -f app

ps: ## Show service status
	$(COMPOSE) ps

shell: ## Open a shell in the lab container (same as the in-app terminal)
	$(COMPOSE) exec app bash

reset: ## Wipe the learner's scratch cluster state
	$(COMPOSE) exec app bash /app/content/reset.sh

release: ## Publish a version: make release VERSION=1.2.3 (tags + pushes -> GitHub Actions builds the image to GHCR)
	@test -n "$(VERSION)" || { echo "Usage: make release VERSION=1.2.3"; exit 1; }
	@echo "$(VERSION)" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$$' || { echo "✗ VERSION must be semver, e.g. 1.2.3 (no leading 'v')"; exit 1; }
	@test -z "$$(git status --porcelain)" || { echo "✗ Working tree is dirty — commit or stash first."; exit 1; }
	@git rev-parse "v$(VERSION)" >/dev/null 2>&1 && { echo "✗ Tag v$(VERSION) already exists."; exit 1; } || true
	git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	git push origin "v$(VERSION)"
	@echo ""
	@echo "✓ Pushed tag v$(VERSION). The 'release' workflow is now building the image."
	@echo "  Watch it:  GitHub repo > Actions > release"
	@echo "  Result:    ghcr.io/ayenacode/k8s-platform:$(VERSION)  (+ :latest)"
