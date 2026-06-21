#!/bin/bash
# Pass when Deployment "web" runs image nginx:1.27 and the rollout is complete.
set -uo pipefail

img=$(kubectl get deploy web -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)

if [ -z "$img" ]; then
  echo "✗ No Deployment named 'web' found. Did you complete the earlier steps?"
  exit 1
fi
case "$img" in
  *nginx:1.27*) ;;
  *)
    echo "✗ Current image is '$img'; this step expects nginx:1.27."
    echo "  Look at: kubectl set image --help to find the right syntax."
    exit 1
    ;;
esac

ready=$(kubectl get deploy web -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
desired=$(kubectl get deploy web -o jsonpath='{.spec.replicas}' 2>/dev/null)
if [ "${ready:-0}" != "${desired:-x}" ]; then
  echo "✗ Image updated to $img but rollout not finished (${ready:-0}/${desired:-?} ready)."
  echo "  Watch: kubectl rollout status deployment/web"
  exit 1
fi
echo "✓ Deployment 'web' rolled out to $img across all replicas."
exit 0
