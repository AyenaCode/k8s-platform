#!/bin/bash
# Pass once Pod "live-demo" has been restarted at least once — proof the learner
# watched a failing liveness probe trigger a container restart.
set -uo pipefail

restarts=$(kubectl get pod live-demo -o jsonpath='{.status.containerStatuses[0].restartCount}' 2>/dev/null)
if [ -z "$restarts" ]; then
  echo "✗ No Pod 'live-demo'. Apply the Pod from the step first."
  exit 1
fi

if [ "$restarts" -ge 1 ] 2>/dev/null; then
  echo "✓ live-demo has restarted $restarts time(s) — the liveness probe is restarting the stuck container."
  exit 0
fi

echo "✗ live-demo has 0 restarts so far. The liveness probe fails ~15s after start —"
echo "  wait a bit longer (kubectl get pod live-demo -w) until RESTARTS >= 1, then verify."
exit 1
