#!/bin/bash
# Pass when Job "hello" has completed successfully (at least one succeeded Pod).
set -uo pipefail

if ! kubectl get job hello >/dev/null 2>&1; then
  echo "No Job 'hello' found. Create a Job named 'hello' that runs a container to completion."
  echo "Hint: kubectl create job --help"
  exit 1
fi

succeeded=$(kubectl get job hello -o jsonpath='{.status.succeeded}' 2>/dev/null)
if [ "${succeeded:-0}" -ge 1 ] 2>/dev/null; then
  echo "Job 'hello' completed: $succeeded Pod(s) succeeded."
  exit 0
fi

echo "Job 'hello' exists but has not completed yet (succeeded='${succeeded:-0}')."
echo "Check its status: kubectl get jobs,pods"
exit 1
