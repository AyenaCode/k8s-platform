#!/bin/bash
set -uo pipefail

ns=ckad-net

selector=$(kubectl get svc svc-api -n "$ns" -o jsonpath='{.spec.selector.app}' 2>/dev/null)
eps=$(kubectl get endpoints svc-api -n "$ns" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
port=$(kubectl get svc svc-api -n "$ns" -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)

if [ "$selector" != "svc-api" ] || [ "$port" != "80" ] || [ -z "$eps" ]; then
  echo "x Service svc-api must select app=svc-api on port 80 and have endpoints."
  exit 1
fi

echo "OK: Service selector now matches ready Pods: $eps"
