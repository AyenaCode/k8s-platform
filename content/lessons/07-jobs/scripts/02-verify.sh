#!/bin/bash
# Pass when Job "hello" has completed successfully (at least one succeeded Pod).
set -uo pipefail

if ! kubectl get job hello >/dev/null 2>&1; then
  echo "✗ No Job 'hello'. Create it:"
  echo "  kubectl create job hello --image=busybox:1.36 -- /bin/sh -c \"echo hello; sleep 2\""
  exit 1
fi

succeeded=$(kubectl get job hello -o jsonpath='{.status.succeeded}' 2>/dev/null)
if [ "${succeeded:-0}" -ge 1 ] 2>/dev/null; then
  echo "✓ Job 'hello' completed: $succeeded Pod(s) succeeded."
  exit 0
fi

echo "✗ Job 'hello' has not completed yet (succeeded='${succeeded:-0}')."
echo "  Wait for it: kubectl wait --for=condition=complete job/hello --timeout=60s"
exit 1
