#!/bin/bash
# Break #2: a Deployment whose container exits 1 immediately -> CrashLoopBackOff.
# Idempotent (apply). The learner re-applies with a command that stays alive.
set -uo pipefail

kubectl apply -f - <<'YAML' >/dev/null
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crasher
spec:
  replicas: 1
  selector:
    matchLabels:
      app: crasher
  template:
    metadata:
      labels:
        app: crasher
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["sh", "-c", "echo starting; exit 1"]   # <- dies at once
YAML

echo "Broke it. 'crasher' starts then exits 1, so the kubelet restarts it forever."
echo "Diagnose: kubectl get pods   then   kubectl logs -l app=crasher  /  describe pod"
