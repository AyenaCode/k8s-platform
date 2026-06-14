#!/bin/bash
set -uo pipefail

ns=ckad-net

api_available=$(kubectl get deploy api -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
front_phase=$(kubectl get pod frontend -n "$ns" -o jsonpath='{.status.phase}' 2>/dev/null)
target=$(kubectl get networkpolicy api-allow-frontend -n "$ns" -o jsonpath='{.spec.podSelector.matchLabels.app}' 2>/dev/null)
from=$(kubectl get networkpolicy api-allow-frontend -n "$ns" -o jsonpath='{.spec.ingress[0].from[0].podSelector.matchLabels.app}' 2>/dev/null)
port=$(kubectl get networkpolicy api-allow-frontend -n "$ns" -o jsonpath='{.spec.ingress[0].ports[0].port}' 2>/dev/null)
protocol=$(kubectl get networkpolicy api-allow-frontend -n "$ns" -o jsonpath='{.spec.ingress[0].ports[0].protocol}' 2>/dev/null)
ptype=$(kubectl get networkpolicy api-allow-frontend -n "$ns" -o jsonpath='{.spec.policyTypes[0]}' 2>/dev/null)

if [ "${api_available:-0}" -lt 1 ] 2>/dev/null || [ "$front_phase" != "Running" ]; then
  echo "x Deployment api must be available and Pod frontend must be Running."
  exit 1
fi
if [ "$target" != "api" ] || [ "$from" != "frontend" ] || [ "$port" != "80" ] || [ "$protocol" != "TCP" ] || [ "$ptype" != "Ingress" ]; then
  echo "x NetworkPolicy must select app=api and allow app=frontend on TCP/80 ingress."
  exit 1
fi

echo "OK: NetworkPolicy allows only frontend traffic to the API on port 80."
