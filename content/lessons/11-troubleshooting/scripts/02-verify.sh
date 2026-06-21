#!/bin/bash
# Pass when the broken-img Deployment is healthy again (1 available replica),
# i.e. the learner replaced the bad image with a real one.
set -uo pipefail

if ! kubectl get deploy broken-img >/dev/null 2>&1; then
  echo "✗ Deployment 'broken-img' is gone. Re-apply it with a valid image (keep the name)."
  exit 1
fi

img=$(kubectl get deploy broken-img -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)
avail=$(kubectl get deploy broken-img -o jsonpath='{.status.availableReplicas}' 2>/dev/null)

if [ "${avail:-0}" -ge 1 ] 2>/dev/null; then
  echo "✓ Fixed: 'broken-img' is running image '$img' with $avail available replica(s)."
  exit 0
fi

echo "✗ 'broken-img' still has no available replicas (image='$img')."
echo "  Run: kubectl describe pod -l app=broken-img   and read the Events section for what failed."
exit 1
