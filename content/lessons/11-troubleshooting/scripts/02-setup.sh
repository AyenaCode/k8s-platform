#!/bin/bash
# Break #1: a Deployment whose image tag does not exist -> ImagePullBackOff.
# Idempotent (apply). The learner must diagnose and re-apply with a valid image.
set -uo pipefail

kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: broken-img
spec:
  replicas: 1
  selector:
    matchLabels:
      app: broken-img
  template:
    metadata:
      labels:
        app: broken-img
    spec:
      containers:
      - name: app
        image: nginx:doesnotexist99999    # <- bad tag, will never pull
YAML

echo "Broke it. A Pod for 'broken-img' is stuck pulling a nonexistent image."
echo "Diagnose: kubectl get pods   then   kubectl describe pod -l app=broken-img"
