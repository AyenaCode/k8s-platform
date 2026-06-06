#!/bin/bash
# Pass when the crasher Deployment stays up (1 available replica): the learner
# replaced the exiting command with one that keeps running.
set -uo pipefail

if ! kubectl get deploy crasher >/dev/null 2>&1; then
  echo "✗ Deployment 'crasher' is gone. Re-apply it with a long-running command (keep the name)."
  exit 1
fi

avail=$(kubectl get deploy crasher -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
if [ "${avail:-0}" -ge 1 ] 2>/dev/null; then
  echo "✓ Fixed: 'crasher' has $avail available replica(s): the container no longer exits."
  exit 0
fi

echo "✗ 'crasher' still has no available replicas: its container is still crashing."
echo "  Re-apply with a command that stays alive, e.g.: sleep 3600  (or run a real server)."
exit 1
