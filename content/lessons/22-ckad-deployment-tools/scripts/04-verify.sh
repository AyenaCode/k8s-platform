#!/bin/bash
set -uo pipefail

ns=ckad-deploy

stable=$(kubectl get deploy web-stable -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
canary=$(kubectl get deploy web-canary -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
sel_app=$(kubectl get svc web -n "$ns" -o jsonpath='{.spec.selector.app}' 2>/dev/null)
sel_track=$(kubectl get svc web -n "$ns" -o jsonpath='{.spec.selector.track}' 2>/dev/null)
eps=$(kubectl get endpoints web -n "$ns" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
count=$(printf '%s\n' $eps | sed '/^$/d' | wc -l | tr -d ' ')

if [ "${stable:-0}" -lt 4 ] 2>/dev/null || [ "${canary:-0}" -lt 1 ] 2>/dev/null; then
  echo "x web-stable needs 4 available replicas and web-canary needs 1."
  exit 1
fi
if [ "$sel_app" != "web" ] || [ -n "$sel_track" ]; then
  echo "x Service web must select only app=web, not a track."
  exit 1
fi
if [ "$count" -lt 5 ] 2>/dev/null; then
  echo "x Service web should have endpoints from all 5 Pods."
  exit 1
fi

echo "OK: canary ratio is 4 stable replicas to 1 canary replica behind one Service."
