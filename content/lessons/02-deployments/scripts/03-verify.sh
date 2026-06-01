#!/bin/bash
# Pass when Deployment "web" is scaled to 5 ready replicas.
set -uo pipefail

ready=$(kubectl get deploy web -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
desired=$(kubectl get deploy web -o jsonpath='{.spec.replicas}' 2>/dev/null)

if [ -z "$desired" ]; then
  echo "✗ No Deployment named 'web'. Did you complete the previous step?"
  exit 1
fi
if [ "$desired" != "5" ]; then
  echo "✗ Deployment 'web' is set to $desired replicas; scale it to 5: kubectl scale deployment web --replicas=5"
  exit 1
fi
if [ "${ready:-0}" != "5" ]; then
  echo "✗ Only ${ready:-0}/5 replicas ready — wait for the new Pods to start."
  exit 1
fi
echo "✓ Deployment 'web' scaled to 5/5 replicas."
exit 0
