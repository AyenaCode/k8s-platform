#!/bin/bash
set -uo pipefail

kubectl create namespace ckad-net >/dev/null 2>&1 || true
kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: svc-api
  namespace: ckad-net
spec:
  replicas: 1
  selector:
    matchLabels:
      app: svc-api
  template:
    metadata:
      labels:
        app: svc-api
    spec:
      containers:
      - name: api
        image: nginx:1.27
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: svc-api
  namespace: ckad-net
spec:
  selector:
    app: wrong-label
  ports:
  - port: 80
    targetPort: 80
YAML

kubectl rollout status deployment/svc-api -n ckad-net --timeout=90s
echo "svc-api Service is broken on purpose: it has no endpoints."
