#!/bin/bash
# Pass when CronJob "report" exists with a schedule AND the manually-triggered
# Job "report-now" (created via --from=cronjob/report) has completed.
set -uo pipefail

sched=$(kubectl get cronjob report -o jsonpath='{.spec.schedule}' 2>/dev/null)
if [ -z "$sched" ]; then
  echo "✗ No CronJob 'report'. Create it:"
  echo "  kubectl create cronjob report --image=busybox:1.36 --schedule=\"*/1 * * * *\" -- /bin/sh -c \"date\""
  exit 1
fi

if ! kubectl get job report-now >/dev/null 2>&1; then
  echo "✓ CronJob 'report' exists (schedule: $sched), but no manual run yet."
  echo "  Trigger one: kubectl create job report-now --from=cronjob/report"
  exit 1
fi

succeeded=$(kubectl get job report-now -o jsonpath='{.status.succeeded}' 2>/dev/null)
if [ "${succeeded:-0}" -ge 1 ] 2>/dev/null; then
  echo "✓ CronJob 'report' (schedule: $sched) created, and 'report-now' completed from its template."
  exit 0
fi

echo "✗ CronJob 'report' exists but Job 'report-now' has not completed yet."
echo "  Wait: kubectl wait --for=condition=complete job/report-now --timeout=60s"
exit 1
