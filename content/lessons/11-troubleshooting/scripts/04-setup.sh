#!/bin/bash
# Break #3: a healthy Deployment "api" (labels app=api) but a Service "api" whose
# selector is app=api-v2 -> no endpoints. Idempotent. Learner fixes the selector.
set -uo pipefail

kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api          # <- the Pods are labelled app=api
    spec:
      containers:
      - name: app
        image: nginx:1.27
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api-v2           # <- WRONG: matches no Pod, so the Service is empty
  ports:
  - port: 80
    targetPort: 80
YAML

kubectl rollout status deploy/api --timeout=90s >/dev/null 2>&1
echo "Broke it. Service 'api' has the wrong selector and routes to nothing."
echo "Diagnose: kubectl get endpoints api   (shows <none>)   then compare Pod labels vs Service selector."
