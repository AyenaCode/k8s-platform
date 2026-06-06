#!/bin/bash
# Pass when Pod "hog" has been OOMKilled: its last terminated state reason is
# OOMKilled (checked on either the last or current terminated state).
set -uo pipefail

if ! kubectl get pod hog >/dev/null 2>&1; then
  echo "✗ No Pod 'hog'. Apply the Pod from the step first."
  exit 1
fi

last=$(kubectl get pod hog -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}' 2>/dev/null)
cur=$(kubectl get pod hog -o jsonpath='{.status.containerStatuses[0].state.terminated.reason}' 2>/dev/null)

if [ "$last" = "OOMKilled" ] || [ "$cur" = "OOMKilled" ]; then
  echo "✓ hog was OOMKilled: it exceeded its 20Mi memory limit and the kernel killed it."
  exit 0
fi

echo "✗ hog has not been OOMKilled yet (lastState reason='${last:-none}')."
echo "  Give it a few seconds to allocate past 20Mi, then verify again."
exit 1
