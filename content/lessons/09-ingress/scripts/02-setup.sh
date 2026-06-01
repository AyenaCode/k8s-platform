#!/bin/bash
# Pre-seed: a "site" Deployment (nginx) for the learner to expose and route to.
# Idempotent — safe to click "Prepare task" more than once.
set -uo pipefail

if kubectl get deploy site >/dev/null 2>&1; then
  echo "Deployment 'site' already exists — good."
else
  echo "Creating Deployment 'site' (nginx)..."
  kubectl create deployment site --image=nginx:1.27 >/dev/null
fi

echo "Waiting for it to be ready..."
kubectl rollout status deploy/site --timeout=90s
echo "Ready. Now expose it: kubectl expose deployment site --name=site-svc --port=80"
