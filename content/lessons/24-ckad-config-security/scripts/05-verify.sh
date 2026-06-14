#!/bin/bash
set -uo pipefail

ns=ckad-sec
pod=hardened

phase=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.status.phase}' 2>/dev/null)
image=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.containers[0].image}' 2>/dev/null)
run_non_root=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.securityContext.runAsNonRoot}' 2>/dev/null)
seccomp=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.securityContext.seccompProfile.type}' 2>/dev/null)
ape=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.containers[0].securityContext.allowPrivilegeEscalation}' 2>/dev/null)
drop=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.containers[0].securityContext.capabilities.drop[0]}' 2>/dev/null)

if [ "$phase" != "Running" ]; then
  echo "x hardened Pod must be Running."
  exit 1
fi
if [ "$image" != "nginxinc/nginx-unprivileged:1.27" ] || [ "$run_non_root" != "true" ] || [ "$seccomp" != "RuntimeDefault" ] || [ "$ape" != "false" ] || [ "$drop" != "ALL" ]; then
  echo "x hardened must use unprivileged nginx, runAsNonRoot, RuntimeDefault seccomp, no privilege escalation, and drop ALL capabilities."
  exit 1
fi

echo "OK: hardened Pod security context is correctly restricted."
