#!/bin/bash
set -uo pipefail

kubectl create namespace ckad-observe >/dev/null 2>&1 || true
kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: legacy-web
  namespace: ckad-observe
spec:
  replicas: 1
  selector:
    matchLabels:
      app: legacy-web
  template:
    metadata:
      labels:
        app: legacy-web
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
  name: legacy-web
  namespace: ckad-observe
spec:
  selector:
    app: legacy-web
  ports:
  - port: 80
    targetPort: 80
YAML

cat >/root/ckad-deprecated-ingress.yaml <<'YAML'
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: legacy-ing
  namespace: ckad-observe
spec:
  rules:
  - host: legacy.ckad.localhost
    http:
      paths:
      - path: /
        backend:
          serviceName: legacy-web
          servicePort: 80
YAML

echo "Wrote deprecated manifest to /root/ckad-deprecated-ingress.yaml."
echo "Rewrite it for networking.k8s.io/v1 and apply it."
