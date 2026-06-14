#!/bin/bash
set -uo pipefail

ns=ckad-deploy
dep=kustom-web

replicas=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.replicas}' 2>/dev/null)
available=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
image=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)
dep_label=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.metadata.labels.environment}' 2>/dev/null)
pod_label=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.metadata.labels.environment}' 2>/dev/null)
svc_port=$(kubectl get svc "$dep" -n "$ns" -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)

if [ "$replicas" != "2" ] || [ "${available:-0}" -lt 2 ] 2>/dev/null; then
  echo "x kustom-web must have 2 available replicas."
  exit 1
fi
if [ "$image" != "nginx:1.27" ] || [ "$dep_label" != "prod" ] || [ "$pod_label" != "prod" ] || [ "$svc_port" != "80" ]; then
  echo "x Expected nginx:1.27, environment=prod labels, and Service port 80."
  exit 1
fi

echo "OK: Kustomize overlay produced the requested prod resources."
