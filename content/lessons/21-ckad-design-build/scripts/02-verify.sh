#!/bin/bash
set -uo pipefail

ns=ckad-design
name=image-audit

if ! kubectl get ns "$ns" >/dev/null 2>&1; then
  echo "x Namespace '$ns' is missing."
  exit 1
fi

schedule=$(kubectl get cronjob "$name" -n "$ns" -o jsonpath='{.spec.schedule}' 2>/dev/null)
image=$(kubectl get cronjob "$name" -n "$ns" -o jsonpath='{.spec.jobTemplate.spec.template.spec.containers[0].image}' 2>/dev/null)
restart=$(kubectl get cronjob "$name" -n "$ns" -o jsonpath='{.spec.jobTemplate.spec.template.spec.restartPolicy}' 2>/dev/null)
history=$(kubectl get cronjob "$name" -n "$ns" -o jsonpath='{.spec.successfulJobsHistoryLimit}' 2>/dev/null)
cmd=$(kubectl get cronjob "$name" -n "$ns" -o jsonpath='{.spec.jobTemplate.spec.template.spec.containers[0].command}' 2>/dev/null)
args=$(kubectl get cronjob "$name" -n "$ns" -o jsonpath='{.spec.jobTemplate.spec.template.spec.containers[0].args}' 2>/dev/null)

if [ "$schedule" != "*/5 * * * *" ]; then
  echo "x CronJob schedule is '$schedule', expected '*/5 * * * *'."
  exit 1
fi
if [ "$image" != "busybox:1.36" ]; then
  echo "x CronJob image is '${image:-missing}', expected busybox:1.36."
  exit 1
fi
if [ "$restart" != "OnFailure" ]; then
  echo "x restartPolicy is '${restart:-missing}', expected OnFailure."
  exit 1
fi
if [ "$history" != "2" ]; then
  echo "x successfulJobsHistoryLimit is '${history:-missing}', expected 2."
  exit 1
fi
if ! printf '%s %s' "$cmd" "$args" | grep -q "image-audit"; then
  echo "x The CronJob command/args must print 'image-audit'."
  exit 1
fi

echo "OK: CronJob image-audit uses busybox:1.36 on the requested schedule."
