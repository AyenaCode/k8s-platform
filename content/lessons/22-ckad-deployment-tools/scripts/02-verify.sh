#!/bin/bash
set -uo pipefail

ns=ckad-deploy
dep=api

replicas=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.replicas}' 2>/dev/null)
available=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
image=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)
strategy=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.strategy.type}' 2>/dev/null)
surge=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.strategy.rollingUpdate.maxSurge}' 2>/dev/null)
unavailable=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.strategy.rollingUpdate.maxUnavailable}' 2>/dev/null)

if [ "$replicas" != "3" ] || [ "${available:-0}" -lt 3 ] 2>/dev/null; then
  echo "x Deployment api must have 3 available replicas."
  exit 1
fi
if [ "$image" != "httpd:2.4" ]; then
  echo "x Deployment api image is '${image:-missing}', expected httpd:2.4."
  exit 1
fi
if [ "$strategy" != "RollingUpdate" ] || [ "$surge" != "1" ] || [ "$unavailable" != "1" ]; then
  echo "x RollingUpdate must use maxSurge=1 and maxUnavailable=1."
  exit 1
fi

echo "OK: api rolled to httpd:2.4 with controlled rolling-update settings."
