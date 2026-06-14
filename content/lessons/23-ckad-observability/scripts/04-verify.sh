#!/bin/bash
set -uo pipefail

ns=ckad-observe
dep=bad-command

available=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
cmd=$(kubectl get deploy "$dep" -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].command}' 2>/dev/null)

if [ "${available:-0}" -lt 1 ] 2>/dev/null && [ "${available:-0}" != "1" ]; then
  echo "x bad-command still has no available replicas."
  echo "  Current command: ${cmd:-missing}"
  exit 1
fi
if printf '%s' "$cmd" | grep -q "exit 1"; then
  echo "x The container command still exits with status 1."
  exit 1
fi

echo "OK: bad-command has been patched into a healthy workload."
