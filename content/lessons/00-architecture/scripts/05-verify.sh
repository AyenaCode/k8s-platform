#!/bin/bash
# Pass when the learner has created the 'recon' namespace — proof they explored
# the live cluster and carved out their own slice of it.
set -uo pipefail

if kubectl get namespace recon >/dev/null 2>&1; then
  echo "✓ Namespace 'recon' exists — you mapped the cluster and claimed your own slice. Welcome aboard!"
  exit 0
fi

echo "✗ No namespace 'recon' yet. Run: kubectl create namespace recon"
exit 1
