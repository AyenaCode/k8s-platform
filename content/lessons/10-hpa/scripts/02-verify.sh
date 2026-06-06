#!/bin/bash
# Pass when an HPA targets the web-hpa Deployment, caps at 5 replicas, AND is
# actually reading CPU metrics (TARGETS is a real %, not <unknown>). The metric
# takes ~15-30s to appear after the HPA is created, so we retry briefly.
set -uo pipefail

target=$(kubectl get hpa web-hpa -o jsonpath='{.spec.scaleTargetRef.name}' 2>/dev/null)
if [ -z "$target" ]; then
  echo "✗ No HPA 'web-hpa'. Create it:"
  echo "  kubectl autoscale deployment web-hpa --cpu=50% --min=1 --max=5"
  exit 1
fi
if [ "$target" != "web-hpa" ]; then
  echo "✗ HPA 'web-hpa' targets '$target', expected the web-hpa Deployment."
  exit 1
fi

max=$(kubectl get hpa web-hpa -o jsonpath='{.spec.maxReplicas}' 2>/dev/null)
if [ "$max" != "5" ]; then
  echo "✗ HPA maxReplicas is '$max', expected 5 (use --max=5)."
  exit 1
fi

# Wait for the CPU metric to populate. .status.currentMetrics is empty/null until
# metrics-server has delivered a sample the HPA can compute against.
metrics=""
for i in $(seq 1 12); do
  metrics=$(kubectl get hpa web-hpa -o jsonpath='{.status.currentMetrics}' 2>/dev/null)
  if [ -n "$metrics" ] && [ "$metrics" != "null" ] && [ "$metrics" != "[]" ]; then
    break
  fi
  sleep 3
done

if [ -z "$metrics" ] || [ "$metrics" = "null" ] || [ "$metrics" = "[]" ]; then
  echo "✗ HPA exists but is not reading CPU metrics yet (TARGETS shows <unknown>)."
  echo "  Give metrics-server ~30s, then verify again. If it stays unknown, the target"
  echo "  Pods are missing cpu requests."
  exit 1
fi

util=$(kubectl get hpa web-hpa -o jsonpath='{.status.currentMetrics[0].resource.current.averageUtilization}' 2>/dev/null)
echo "✓ HPA 'web-hpa' is live: reading CPU (current ~${util:-0}% of the 50% target), max 5 replicas."
exit 0
