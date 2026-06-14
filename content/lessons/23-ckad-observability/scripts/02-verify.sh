#!/bin/bash
set -uo pipefail

ns=ckad-observe
dep=probe-api

available=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
image=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)
readiness=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].readinessProbe.httpGet.path}' 2>/dev/null)
readiness_port=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].readinessProbe.httpGet.port}' 2>/dev/null)
liveness=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].livenessProbe.httpGet.path}' 2>/dev/null)
liveness_port=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].livenessProbe.httpGet.port}' 2>/dev/null)

if [ "$image" != "nginx:1.27" ] || [ "${available:-0}" -lt 1 ] 2>/dev/null; then
  echo "x probe-api must run nginx:1.27 with 1 available replica."
  exit 1
fi
if [ "$readiness" != "/" ] || [ "$readiness_port" != "80" ] || [ "$liveness" != "/" ] || [ "$liveness_port" != "80" ]; then
  echo "x readinessProbe and livenessProbe must use httpGet path / on port 80."
  exit 1
fi

echo "OK: probe-api has working readiness and liveness probes."
