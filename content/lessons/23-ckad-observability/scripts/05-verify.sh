#!/bin/bash
set -uo pipefail

ns=ckad-observe
ing=legacy-ing

api=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.apiVersion}' 2>/dev/null)
path_type=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.spec.rules[0].http.paths[0].pathType}' 2>/dev/null)
svc=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.spec.rules[0].http.paths[0].backend.service.name}' 2>/dev/null)
port=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.spec.rules[0].http.paths[0].backend.service.port.number}' 2>/dev/null)

if [ "$api" != "networking.k8s.io/v1" ] || [ "$path_type" != "Prefix" ] || [ "$svc" != "legacy-web" ] || [ "$port" != "80" ]; then
  echo "x Ingress must use networking.k8s.io/v1, pathType Prefix, service legacy-web:80."
  exit 1
fi

echo "OK: deprecated Ingress manifest was migrated to networking.k8s.io/v1."
