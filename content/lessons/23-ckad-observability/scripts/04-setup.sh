#!/bin/bash
set -uo pipefail

kubectl create namespace ckad-observe >/dev/null 2>&1 || true
kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bad-command
  namespace: ckad-observe
spec:
  replicas: 1
  selector:
    matchLabels:
      app: bad-command
  template:
    metadata:
      labels:
        app: bad-command
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["/bin/sh", "-c", "echo fatal: bad startup; exit 1"]
YAML

echo "bad-command is broken on purpose. Diagnose it and patch the command."
