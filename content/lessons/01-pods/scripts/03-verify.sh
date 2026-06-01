#!/bin/bash
# Pass when the "web" Pod carries the label seen=true (proves the learner used
# kubectl against it).
set -uo pipefail

val=$(kubectl get pod web -o jsonpath='{.metadata.labels.seen}' 2>/dev/null)

if [ "$val" = "true" ]; then
  echo "✓ Label seen=true found on Pod 'web'. You've got the inspection toolkit down!"
  exit 0
fi

echo "✗ Pod 'web' is missing label seen=true. Run: kubectl label pod web seen=true"
exit 1
