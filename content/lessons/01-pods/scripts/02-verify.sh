#!/bin/bash
# Pass when a Pod named "web" exists and is Running.
set -uo pipefail

phase=$(kubectl get pod web -o jsonpath='{.status.phase}' 2>/dev/null)

if [ -z "$phase" ]; then
  echo "✗ No Pod named 'web' found. Run: kubectl run web --image=nginx"
  exit 1
fi

if [ "$phase" != "Running" ]; then
  echo "✗ Pod 'web' is '$phase', not Running yet. Give it a few seconds (image pull)."
  exit 1
fi

ready=$(kubectl get pod web -o jsonpath='{range .status.conditions[?(@.type=="Ready")]}{.status}{end}' 2>/dev/null)
if [ "$ready" != "True" ]; then
  echo "✗ Pod 'web' is Running but not Ready yet."
  exit 1
fi

echo "✓ Pod 'web' is Running and Ready. Nice — your first Pod is live!"
exit 0
