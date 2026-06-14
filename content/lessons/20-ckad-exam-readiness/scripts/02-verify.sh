#!/bin/bash
# Pass when the warm-up namespace contains a healthy Deployment and Service.
set -uo pipefail

ns=ckad-ready

if ! kubectl get ns "$ns" >/dev/null 2>&1; then
  echo "x Namespace '$ns' is missing."
  exit 1
fi

img=$(kubectl get deploy ready-nginx -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)
avail=$(kubectl get deploy ready-nginx -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
if [ "$img" != "nginx:1.27" ] || [ "${avail:-0}" -lt 1 ] 2>/dev/null; then
  echo "x Deployment 'ready-nginx' must run nginx:1.27 with 1 available replica."
  echo "  image='${img:-missing}' available='${avail:-0}'"
  exit 1
fi

port=$(kubectl get svc ready-nginx -n "$ns" -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
eps=$(kubectl get endpoints ready-nginx -n "$ns" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
if [ "$port" != "80" ] || [ -z "$eps" ]; then
  echo "x Service 'ready-nginx' must expose port 80 and have ready endpoints."
  exit 1
fi

echo "OK: ckad-ready has nginx:1.27 behind a Service with endpoints: $eps"
