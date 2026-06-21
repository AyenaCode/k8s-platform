#!/bin/bash
# Pass when Service "api" has at least one endpoint: the learner aligned the
# Service selector with the Pod labels (app=api).
set -uo pipefail

if ! kubectl get svc api >/dev/null 2>&1; then
  echo "✗ No Service 'api'. Re-apply it (keep the name) with a selector that matches the Pods."
  exit 1
fi

ips=$(kubectl get endpoints api -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
if [ -n "$ips" ]; then
  sel=$(kubectl get svc api -o jsonpath='{.spec.selector}' 2>/dev/null)
  echo "✓ Fixed: Service 'api' selector $sel now has endpoints: $ips."
  exit 0
fi

echo "✗ Service 'api' still has no endpoints: its selector does not match any Pod."
echo "  Run: kubectl get svc api -o yaml   and compare spec.selector to: kubectl get pods -l app=api --show-labels"
exit 1
