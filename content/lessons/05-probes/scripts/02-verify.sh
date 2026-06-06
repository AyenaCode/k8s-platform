#!/bin/bash
# Pass when Pod "ready-demo" is Ready (readiness probe passing) AND was never
# restarted, proving readiness gates traffic without killing the container.
set -uo pipefail

phase=$(kubectl get pod ready-demo -o jsonpath='{.status.phase}' 2>/dev/null)
if [ -z "$phase" ]; then
  echo "✗ No Pod 'ready-demo'. Apply the Pod from the step first."
  exit 1
fi

ready=$(kubectl get pod ready-demo -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null)
if [ "$ready" != "True" ]; then
  echo "✗ Pod 'ready-demo' is not Ready yet. Make the readiness probe pass:"
  echo "  kubectl exec ready-demo -- touch /tmp/healthy"
  exit 1
fi

restarts=$(kubectl get pod ready-demo -o jsonpath='{.status.containerStatuses[0].restartCount}' 2>/dev/null)
if [ "${restarts:-0}" != "0" ]; then
  echo "✗ Pod restarted ${restarts} time(s): that should not happen for a readiness probe."
  exit 1
fi

echo "✓ ready-demo is 1/1 Ready with 0 restarts: readiness gates traffic, no restart."
exit 0
