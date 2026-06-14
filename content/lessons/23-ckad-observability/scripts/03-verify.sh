#!/bin/bash
set -uo pipefail

data=$(kubectl get configmap logger-snapshot -n ckad-observe -o jsonpath='{.data.logger\.log}' 2>/dev/null)
if [ -z "$data" ]; then
  echo "x ConfigMap logger-snapshot with key logger.log is missing."
  exit 1
fi
if ! printf '%s' "$data" | grep -q "health=ok"; then
  echo "x logger.log must contain a health=ok line from kubectl logs."
  exit 1
fi

echo "OK: logger-snapshot stores log evidence from the workload."
