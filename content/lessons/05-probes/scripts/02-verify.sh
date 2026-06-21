#!/bin/bash
# Pass when Pod "ready-demo" is Ready (readiness probe passing) AND was never
# restarted, proving readiness gates traffic without killing the container.
set -uo pipefail

phase=$(kubectl get pod ready-demo -o jsonpath='{.status.phase}' 2>/dev/null)
if [ -z "$phase" ]; then
  echo "No Pod named 'ready-demo' found. Create it with a readiness probe first."
  exit 1
fi

ready=$(kubectl get pod ready-demo -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null)
if [ "$ready" != "True" ]; then
  echo "Pod 'ready-demo' is not Ready yet."
  echo "Use 'kubectl describe pod ready-demo' to see what the probe is checking, then make it pass."
  exit 1
fi

restarts=$(kubectl get pod ready-demo -o jsonpath='{.status.containerStatuses[0].restartCount}' 2>/dev/null)
if [ "${restarts:-0}" != "0" ]; then
  echo "Pod restarted ${restarts} time(s). A readiness probe should never restart the container."
  echo "Check 'kubectl describe pod ready-demo': you may have configured a liveness probe instead."
  exit 1
fi

echo "ready-demo is 1/1 Ready with 0 restarts: readiness gates traffic without restarting."
exit 0
