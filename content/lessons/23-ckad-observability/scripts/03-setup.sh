#!/bin/bash
set -uo pipefail

kubectl create namespace ckad-observe >/dev/null 2>&1 || true
kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: logger
  namespace: ckad-observe
spec:
  replicas: 1
  selector:
    matchLabels:
      app: logger
  template:
    metadata:
      labels:
        app: logger
    spec:
      containers:
      - name: logger
        image: busybox:1.36
        command: ["/bin/sh", "-c", "while true; do echo health=ok; sleep 3; done"]
YAML

kubectl rollout status deployment/logger -n ckad-observe --timeout=90s
echo "logger is producing health=ok lines. Capture them into ConfigMap logger-snapshot."
