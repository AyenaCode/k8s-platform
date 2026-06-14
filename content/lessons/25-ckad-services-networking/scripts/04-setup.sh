#!/bin/bash
set -uo pipefail

kubectl create namespace ckad-net >/dev/null 2>&1 || true
kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingress-web
  namespace: ckad-net
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ingress-web
  template:
    metadata:
      labels:
        app: ingress-web
    spec:
      containers:
      - name: web
        image: nginx:1.27
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: ingress-web
  namespace: ckad-net
spec:
  selector:
    app: ingress-web
  ports:
  - port: 80
    targetPort: 80
YAML

kubectl rollout status deployment/ingress-web -n ckad-net --timeout=90s
echo "ingress-web is ready. Create Ingress ckad-web for host ckad.localhost."
