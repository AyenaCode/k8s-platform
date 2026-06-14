#!/bin/bash
set -uo pipefail

ns=ckad-net
ing=ckad-web

host=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.spec.rules[0].host}' 2>/dev/null)
path=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.spec.rules[0].http.paths[0].path}' 2>/dev/null)
path_type=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.spec.rules[0].http.paths[0].pathType}' 2>/dev/null)
svc=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.spec.rules[0].http.paths[0].backend.service.name}' 2>/dev/null)
port=$(kubectl get ingress "$ing" -n "$ns" -o jsonpath='{.spec.rules[0].http.paths[0].backend.service.port.number}' 2>/dev/null)

if [ "$host" != "ckad.localhost" ] || [ "$path" != "/" ] || [ "$path_type" != "Prefix" ] || [ "$svc" != "ingress-web" ] || [ "$port" != "80" ]; then
  echo "x Ingress ckad-web must route ckad.localhost/ Prefix to ingress-web:80."
  exit 1
fi

echo "OK: Ingress ckad-web routes ckad.localhost/ to ingress-web:80."
