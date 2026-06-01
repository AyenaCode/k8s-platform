#!/bin/bash
# Pass when Deployment "web" exists with 3 ready replicas.
set -uo pipefail

ready=$(kubectl get deploy web -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
desired=$(kubectl get deploy web -o jsonpath='{.spec.replicas}' 2>/dev/null)

if [ -z "$desired" ]; then
  echo "✗ No Deployment named 'web'. Run: kubectl create deployment web --image=nginx --replicas=3"
  exit 1
fi
if [ "$desired" != "3" ]; then
  echo "✗ Deployment 'web' is set to $desired replicas; this step expects 3."
  exit 1
fi
if [ "${ready:-0}" != "3" ]; then
  echo "✗ Only ${ready:-0}/3 replicas ready — give the Pods a few seconds."
  exit 1
fi
echo "✓ Deployment 'web' has 3/3 replicas ready."
exit 0
