#!/bin/bash
# Pass once Pod "live-demo" has been restarted at least once: proof the liveness
# probe triggered a container restart.
set -uo pipefail

restarts=$(kubectl get pod live-demo -o jsonpath='{.status.containerStatuses[0].restartCount}' 2>/dev/null)
if [ -z "$restarts" ]; then
  echo "No Pod named 'live-demo' found. Create it with a liveness probe first."
  exit 1
fi

if [ "$restarts" -ge 1 ] 2>/dev/null; then
  echo "live-demo has restarted $restarts time(s): the liveness probe is restarting the stuck container."
  exit 0
fi

echo "live-demo has 0 restarts so far."
echo "The probe needs time to fail. Watch the Pod: kubectl get pod live-demo -w"
echo "Wait until RESTARTS reaches 1, then click Verify again."
exit 1
