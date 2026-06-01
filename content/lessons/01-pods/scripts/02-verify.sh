#!/bin/bash
# Pass when a Pod named "web" exists and is Ready.
set -uo pipefail

if ! kubectl get pod web >/dev/null 2>&1; then
  echo "✗ No Pod named 'web' found. Run: kubectl run web --image=nginx"
  exit 1
fi

# Use `kubectl wait` rather than parsing the Ready condition by hand: it exits 0
# only when the Ready condition is True, and tolerates a slow first-time image
# pull (waits up to 30s) instead of failing on a transient not-Ready snapshot.
if kubectl wait --for=condition=Ready pod/web --timeout=30s >/dev/null 2>&1; then
  echo "✓ Pod 'web' is Running and Ready. Nice — your first Pod is live!"
  exit 0
fi

phase=$(kubectl get pod web -o jsonpath='{.status.phase}' 2>/dev/null)
echo "✗ Pod 'web' exists (phase: ${phase:-unknown}) but isn't Ready yet. Give it a few seconds (image pull), then verify again."
exit 1
