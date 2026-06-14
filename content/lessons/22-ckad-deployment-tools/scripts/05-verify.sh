#!/bin/bash
set -uo pipefail

ns=ckad-deploy
release=ckad-demo

if ! helm status "$release" -n "$ns" >/dev/null 2>&1; then
  echo "x Helm release '$release' is not installed in namespace '$ns'."
  exit 1
fi

replicas=$(kubectl get deploy -n "$ns" -l app.kubernetes.io/instance="$release" -o jsonpath='{.items[0].spec.replicas}' 2>/dev/null)
available=$(kubectl get deploy -n "$ns" -l app.kubernetes.io/instance="$release" -o jsonpath='{.items[0].status.availableReplicas}' 2>/dev/null)
image=$(kubectl get deploy -n "$ns" -l app.kubernetes.io/instance="$release" -o jsonpath='{.items[0].spec.template.spec.containers[0].image}' 2>/dev/null)
port=$(kubectl get svc -n "$ns" -l app.kubernetes.io/instance="$release" -o jsonpath='{.items[0].spec.ports[0].port}' 2>/dev/null)

if [ "$replicas" != "2" ] || [ "${available:-0}" -lt 2 ] 2>/dev/null; then
  echo "x Helm release Deployment must have 2 available replicas."
  exit 1
fi
if [ "$image" != "nginx:1.27" ] || [ "$port" != "8080" ]; then
  echo "x Expected image nginx:1.27 and Service port 8080 (got image='$image', port='$port')."
  exit 1
fi

echo "OK: Helm release ckad-demo is installed with the requested values."
