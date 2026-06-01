#!/bin/bash
# Pass when PVC "data-pvc" is Bound AND Pod "writer" has the persisted file in the
# mounted volume — proving dynamic provisioning and a successful write.
set -uo pipefail

phase=$(kubectl get pvc data-pvc -o jsonpath='{.status.phase}' 2>/dev/null)
if [ -z "$phase" ]; then
  echo "✗ No PVC 'data-pvc'. Apply the PVC from the step first."
  exit 1
fi
if [ "$phase" != "Bound" ]; then
  echo "✗ PVC 'data-pvc' is '$phase', not Bound. Apply the 'writer' Pod that mounts it —"
  echo "  local-path only provisions the volume once a Pod consumes the claim."
  exit 1
fi

ready=$(kubectl get pod writer -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null)
if [ "$ready" != "True" ]; then
  echo "✗ Pod 'writer' is not Ready. Apply it and wait, then write the file."
  exit 1
fi

content=$(kubectl exec writer -- cat /data/hello.txt 2>/dev/null | tr -d '\r\n')
if [ "$content" != "persisted" ]; then
  echo "✗ /data/hello.txt does not read 'persisted' (got '${content:-empty}')."
  echo "  Write it: kubectl exec writer -- sh -c \"echo persisted > /data/hello.txt\""
  exit 1
fi

echo "✓ PVC 'data-pvc' is Bound and /data/hello.txt persisted — storage outlives the Pod."
exit 0
