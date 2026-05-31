# K8s Learn — local kind cluster + bilingual learning platform.
# Run `make up` to go from zero to a running app at http://localhost:8088.

CLUSTER ?= k8s-learn
IMAGE   ?= k8s-platform:local
NS      ?= courses
URL     ?= http://localhost:8088

.DEFAULT_GOAL := help

.PHONY: help up down cluster build load deploy status logs open redeploy reset check

help: ## Show this help
	@echo "K8s Learn — available commands:"
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN{FS=":.*## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Quick start:  make up   then open $(URL)"

check: ## Check that required tools are installed
	@for t in docker kind kubectl; do \
		command -v $$t >/dev/null 2>&1 || { echo "Missing required tool: $$t"; exit 1; }; \
	done
	@docker info >/dev/null 2>&1 || { echo "Docker daemon is not running."; exit 1; }
	@echo "All required tools are present."

up: check cluster build load deploy ## Create cluster, build + load image, deploy the platform
	@echo ""
	@echo "✓ Platform is up. Open $(URL)"

cluster: ## Create the kind cluster if it does not exist
	@if kind get clusters 2>/dev/null | grep -qx $(CLUSTER); then \
		echo "kind cluster '$(CLUSTER)' already exists."; \
	else \
		echo "Creating kind cluster '$(CLUSTER)'..."; \
		kind create cluster --name $(CLUSTER) --config kind-config.yaml; \
	fi

build: ## Build the app Docker image
	docker build -t $(IMAGE) .

load: ## Load the local image into the kind cluster
	kind load docker-image $(IMAGE) --name $(CLUSTER)

deploy: ## Apply the manifest and wait for the rollout
	kubectl apply -f k8s-platform.yml
	kubectl -n $(NS) rollout status deploy/k8s-platform --timeout=120s

redeploy: build load ## Rebuild the image and restart the deployment
	kubectl -n $(NS) rollout restart deploy/k8s-platform
	kubectl -n $(NS) rollout status deploy/k8s-platform --timeout=120s

status: ## Show the platform resources
	kubectl -n $(NS) get all

logs: ## Tail the platform logs
	kubectl -n $(NS) logs deploy/k8s-platform -f

reset: ## Clean up all exercise namespaces (exo-*)
	bash exercices/reset.sh

down: ## Delete the kind cluster
	kind delete cluster --name $(CLUSTER)
