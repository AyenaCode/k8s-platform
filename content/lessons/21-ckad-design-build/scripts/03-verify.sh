#!/bin/bash
set -uo pipefail

ns=ckad-design
pod=pattern-pod

phase=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.status.phase}' 2>/dev/null)
if [ "$phase" != "Running" ]; then
  echo "x Pod '$pod' must be Running in namespace '$ns' (phase='${phase:-missing}')."
  exit 1
fi

init=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.initContainers[0].name}' 2>/dev/null)
app_img=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.containers[?(@.name=="app")].image}' 2>/dev/null)
sidecar_img=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.containers[?(@.name=="sidecar")].image}' 2>/dev/null)
empty_dir=$(kubectl get pod "$pod" -n "$ns" -o jsonpath='{.spec.volumes[?(@.name=="shared")].emptyDir}' 2>/dev/null)

if [ "$init" != "init-content" ] || [ "$app_img" != "nginx:1.27" ] || [ "$sidecar_img" != "busybox:1.36" ] || [ -z "$empty_dir" ]; then
  echo "x pattern-pod must have init-content, app=nginx:1.27, sidecar=busybox:1.36, and emptyDir volume shared."
  exit 1
fi

page=$(kubectl exec "$pod" -n "$ns" -c app -- cat /usr/share/nginx/html/index.html 2>/dev/null | tr -d '\r')
heartbeat=$(kubectl exec "$pod" -n "$ns" -c sidecar -- test -s /work/heartbeat 2>/dev/null; echo $?)
if ! printf '%s' "$page" | grep -q "CKAD pattern ready"; then
  echo "x The app container does not see the init-generated index.html."
  exit 1
fi
if [ "$heartbeat" != "0" ]; then
  echo "x The sidecar must write a non-empty /work/heartbeat file."
  exit 1
fi

echo "OK: init, app, sidecar, and shared emptyDir are wired correctly."
