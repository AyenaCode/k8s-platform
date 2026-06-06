#!/bin/bash
# Pre-seed: a "web-hpa" Deployment that DECLARES cpu requests: mandatory for HPA,
# because utilization is measured as (used cpu / requested cpu). Without a request
# the HPA can only show <unknown> and never scales. Idempotent.
set -uo pipefail

kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-hpa
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web-hpa
  template:
    metadata:
      labels:
        app: web-hpa
    spec:
      containers:
      - name: app
        image: nginx:1.27
        resources:
          requests:
            cpu: "100m"        # the baseline HPA divides by: REQUIRED
          limits:
            cpu: "200m"
YAML

echo "Waiting for 'web-hpa' to be ready..."
kubectl rollout status deploy/web-hpa --timeout=90s
echo "Ready (cpu request = 100m). Now: kubectl autoscale deployment web-hpa --cpu=50% --min=1 --max=5"
