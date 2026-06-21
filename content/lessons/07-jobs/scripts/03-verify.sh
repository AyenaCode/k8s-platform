#!/bin/bash
# Pass when CronJob "report" exists with a schedule AND the manually-triggered
# Job "report-now" (created via --from=cronjob/report) has completed.
set -uo pipefail

sched=$(kubectl get cronjob report -o jsonpath='{.spec.schedule}' 2>/dev/null)
if [ -z "$sched" ]; then
  echo "No CronJob 'report' found. Create a CronJob named 'report' with a schedule."
  echo "Hint: kubectl create cronjob --help"
  exit 1
fi

if ! kubectl get job report-now >/dev/null 2>&1; then
  echo "CronJob 'report' exists (schedule: $sched), but no manual run found."
  echo "Trigger a manual run from the CronJob template. Hint: kubectl create job --help (look for --from)"
  exit 1
fi

succeeded=$(kubectl get job report-now -o jsonpath='{.status.succeeded}' 2>/dev/null)
if [ "${succeeded:-0}" -ge 1 ] 2>/dev/null; then
  echo "CronJob 'report' (schedule: $sched) exists, and 'report-now' completed successfully."
  exit 0
fi

echo "CronJob 'report' exists but Job 'report-now' has not completed yet."
echo "Check its status: kubectl get jobs,pods"
exit 1
