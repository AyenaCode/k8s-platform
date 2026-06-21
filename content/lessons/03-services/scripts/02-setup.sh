#!/bin/bash
# Pre-seed: ensure a 2-replica "web" Deployment exists so the learner can focus on
# Services. Idempotent, safe to click "Prepare task" more than once.
set -uo pipefail

if kubectl get deploy web >/dev/null 2>&1; then
  echo "Deployment 'web' already exists: good."
else
  echo "Creating Deployment 'web' (nginx, 2 replicas)..."
  kubectl create deployment web --image=nginx --replicas=2 >/dev/null
fi

echo "Waiting for it to be ready..."
kubectl rollout status deploy/web --timeout=90s
echo "Ready. Your next step: expose the Deployment so it has a stable address."
