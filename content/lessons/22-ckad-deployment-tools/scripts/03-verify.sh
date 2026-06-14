#!/bin/bash
set -uo pipefail

ns=ckad-deploy

green=$(kubectl get deploy shop-green -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
blue=$(kubectl get deploy shop-blue -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
sel_app=$(kubectl get svc shop -n "$ns" -o jsonpath='{.spec.selector.app}' 2>/dev/null)
sel_track=$(kubectl get svc shop -n "$ns" -o jsonpath='{.spec.selector.track}' 2>/dev/null)
port=$(kubectl get svc shop -n "$ns" -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
eps=$(kubectl get endpoints shop -n "$ns" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)

if [ "${blue:-0}" -lt 1 ] 2>/dev/null || [ "${green:-0}" -lt 2 ] 2>/dev/null; then
  echo "x shop-blue needs 1 available replica and shop-green needs 2."
  exit 1
fi
if [ "$sel_app" != "shop" ] || [ "$sel_track" != "green" ] || [ "$port" != "80" ] || [ -z "$eps" ]; then
  echo "x Service shop must select app=shop,track=green on port 80 with endpoints."
  exit 1
fi

echo "OK: shop Service is switched to the green Deployment."
