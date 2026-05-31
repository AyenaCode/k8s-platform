#!/bin/bash
# check.sh <namespace> — validate that an exercise namespace is healthy.
# Exit 0 = solved (everything healthy), exit 1 = still broken.
# Uses kubectl only (the platform pod has no jq).
NS="${1:-}"
[ -z "$NS" ] && { echo "Usage: $0 <namespace>"; exit 2; }

kubectl get ns "$NS" >/dev/null 2>&1 || {
  echo "✗ Namespace '$NS' not found — launch the exercise first."
  exit 1
}

problems=0
note() { echo "✗ $1"; problems=$((problems + 1)); }
ok()   { echo "✓ $1"; }

# 1. Every Deployment must have all replicas ready.
while read -r name desired ready; do
  [ -z "$name" ] && continue
  desired="${desired:-0}"; ready="${ready:-0}"
  if [ "$desired" = "0" ] || [ "$desired" != "$ready" ]; then
    note "Deployment '$name': $ready/$desired replicas ready"
  else
    ok "Deployment '$name': $ready/$desired ready"
  fi
done < <(kubectl get deploy -n "$NS" \
  -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.replicas}{" "}{.status.readyReplicas}{"\n"}{end}' 2>/dev/null)

# 2. Every Pod must be Running and Ready.
while read -r pod phase cond; do
  [ -z "$pod" ] && continue
  if [ "$phase" != "Running" ] && [ "$phase" != "Succeeded" ]; then
    note "Pod '$pod' is $phase"
  elif [ "$phase" = "Running" ] && [ "$cond" != "True" ]; then
    note "Pod '$pod' is not Ready"
  fi
done < <(kubectl get pods -n "$NS" \
  -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.status.phase}{" "}{range .status.conditions[?(@.type=="Ready")]}{.status}{end}{"\n"}{end}' 2>/dev/null)

# 3. Every Service that has a selector must have at least one live endpoint.
for svc in $(kubectl get svc -n "$NS" -o jsonpath='{.items[*].metadata.name}' 2>/dev/null); do
  selector=$(kubectl get svc "$svc" -n "$NS" -o jsonpath='{.spec.selector}' 2>/dev/null)
  [ -z "$selector" ] && continue   # headless / no selector → skip
  ips=$(kubectl get endpoints "$svc" -n "$NS" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
  if [ -z "$ips" ]; then
    note "Service '$svc' has no ready endpoints (selector matches no Ready pod)"
  else
    ok "Service '$svc' has live endpoints"
  fi
done

echo "------------------------------------------"
if [ "$problems" -eq 0 ]; then
  echo "✓ All checks passed — exercise solved!"
  exit 0
else
  echo "✗ $problems problem(s) remaining — keep going."
  exit 1
fi
