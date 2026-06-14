#!/bin/bash
set -uo pipefail

ns=ckad-design
pvc=ckad-data
pod=volume-worker

phase=$(kubectl get pvc "$pvc" -n "$ns" -o jsonpath='{.status.phase}' 2>/dev/null)
if [ "$phase" != "Bound" ]; then
  echo "x PVC '$pvc' must be Bound (phase='${phase:-missing}')."
  exit 1
fi

pod_phase=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.status.phase}' 2>/dev/null)
if [ "$pod_phase" != "Running" ]; then
  echo "x Pod '$pod' must be Running (phase='${pod_phase:-missing}')."
  exit 1
fi

pvc_vol=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.volumes[?(@.persistentVolumeClaim.claimName=="ckad-data")].name}' 2>/dev/null)
cache_vol=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.volumes[?(@.name=="cache")].emptyDir}' 2>/dev/null)
data_mount=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.containers[0].volumeMounts[?(@.mountPath=="/data")].name}' 2>/dev/null)
cache_mount=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.containers[0].volumeMounts[?(@.mountPath=="/cache")].name}' 2>/dev/null)

if [ -z "$pvc_vol" ] || [ -z "$cache_vol" ] || [ "$data_mount" != "$pvc_vol" ] || [ "$cache_mount" != "cache" ]; then
  echo "x volume-worker must mount PVC ckad-data at /data and emptyDir cache at /cache."
  exit 1
fi

echo "OK: volume-worker uses both persistent and ephemeral storage."
