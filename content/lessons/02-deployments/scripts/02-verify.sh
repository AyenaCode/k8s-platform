#!/bin/bash
# Pass when Deployment "web" exists with 3 ready replicas.
set -uo pipefail

ready=$(kubectl get deploy web -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
desired=$(kubectl get deploy web -o jsonpath='{.spec.replicas}' 2>/dev/null)

if [ -z "$desired" ]; then
  echo "✗ No Deployment named 'web' found. Check: kubectl get deployments"
  echo "  Hint: kubectl create deployment --help shows the flags you need."
  exit 1
fi
if [ "$desired" != "3" ]; then
  echo "✗ Deployment 'web' has $desired replicas but this step expects 3."
  echo "  Check the --replicas flag in: kubectl create deployment --help"
  exit 1
fi
if [ "${ready:-0}" != "3" ]; then
  echo "✗ Only ${ready:-0}/3 replicas ready. Wait a moment and try again."
  echo "  Watch progress: kubectl get pods -l app=web"
  exit 1
fi
echo "✓ Deployment 'web' has 3/3 replicas ready."
exit 0
