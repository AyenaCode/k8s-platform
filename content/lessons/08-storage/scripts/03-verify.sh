#!/bin/bash
# Pass when StatefulSet "web" has 2 ready replicas AND its per-Pod PVCs
# (data-web-0, data-web-1) both exist and are Bound.
set -uo pipefail

if ! kubectl get statefulset web >/dev/null 2>&1; then
  echo "✗ No StatefulSet 'web'. Apply the headless Service + StatefulSet from the step."
  exit 1
fi

ready=$(kubectl get statefulset web -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
desired=$(kubectl get statefulset web -o jsonpath='{.spec.replicas}' 2>/dev/null)
if [ "${ready:-0}" != "${desired:-x}" ]; then
  echo "✗ StatefulSet 'web' is ${ready:-0}/${desired:-?} ready. Wait for the ordered rollout:"
  echo "  kubectl rollout status statefulset/web"
  exit 1
fi

for pvc in data-web-0 data-web-1; do
  p=$(kubectl get pvc "$pvc" -o jsonpath='{.status.phase}' 2>/dev/null)
  if [ "$p" != "Bound" ]; then
    echo "✗ PVC '$pvc' is '${p:-missing}', expected Bound. Each replica needs its own bound PVC."
    exit 1
  fi
done

echo "✓ StatefulSet 'web' is ${ready}/${desired} ready with per-Pod PVCs data-web-0 & data-web-1 Bound."
exit 0
