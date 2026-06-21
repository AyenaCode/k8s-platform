#!/bin/bash
# Pass when the "web" Pod carries a label node=<X> where <X> is the actual node
# the Pod runs on. This proves the learner really inspected the Pod (read the
# NODE column / describe / yaml) instead of pasting a fixed value.
set -uo pipefail

if ! kubectl get pod web >/dev/null 2>&1; then
  echo "✗ No Pod named 'web' found. Create it in the previous step first."
  exit 1
fi

real=$(kubectl get pod web -o jsonpath='{.spec.nodeName}' 2>/dev/null)
val=$(kubectl get pod web -o jsonpath='{.metadata.labels.node}' 2>/dev/null)

if [ -z "$val" ]; then
  echo "✗ Pod 'web' has no 'node' label yet. Find its node (kubectl get pods -o wide), then add a label node=<that-node>."
  exit 1
fi

if [ "$val" = "$real" ]; then
  echo "✓ Label node=$val matches the real node. You inspected the Pod for real. Toolkit unlocked!"
  exit 0
fi

echo "✗ Label node=$val doesn't match the actual node ($real). Re-check the NODE column with: kubectl get pods -o wide"
exit 1
