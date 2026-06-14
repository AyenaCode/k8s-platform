#!/bin/bash
set -uo pipefail

ns=ckad-sec
pod=secure-app

mode=$(kubectl get configmap app-settings -n "$ns" -o jsonpath='{.data.MODE}' 2>/dev/null)
password_b64=$(kubectl get secret db-secret -n "$ns" -o jsonpath='{.data.PASSWORD}' 2>/dev/null)
phase=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.status.phase}' 2>/dev/null)

if [ "$mode" != "prod" ]; then
  echo "x ConfigMap app-settings must contain MODE=prod."
  exit 1
fi
if [ "$(printf '%s' "$password_b64" | base64 -d 2>/dev/null)" != "ckad-pass" ]; then
  echo "x Secret db-secret must contain PASSWORD=ckad-pass."
  exit 1
fi
if [ "$phase" != "Running" ]; then
  echo "x Pod secure-app must be Running."
  exit 1
fi

pod_mode=$(kubectl exec "$pod" -n "$ns" -- printenv MODE 2>/dev/null | tr -d '\r\n')
pod_password=$(kubectl exec "$pod" -n "$ns" -- printenv PASSWORD 2>/dev/null | tr -d '\r\n')
if [ "$pod_mode" != "prod" ] || [ "$pod_password" != "ckad-pass" ]; then
  echo "x secure-app must receive MODE and PASSWORD through envFrom."
  exit 1
fi

echo "OK: ConfigMap and Secret are injected into secure-app."
