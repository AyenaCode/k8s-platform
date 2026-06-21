#!/bin/bash
# Pass when a Service "web" exists and has at least one ready endpoint.
set -uo pipefail

if ! kubectl get svc web >/dev/null 2>&1; then
  echo "No Service named 'web' found. Check: kubectl get svc"
  echo "Hint: use 'kubectl expose --help' to find the right command."
  exit 1
fi

# Endpoints address list (works across kubectl versions via the Endpoints object).
ips=$(kubectl get endpoints web -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)

if [ -z "$ips" ]; then
  echo "Service 'web' exists but has no endpoints: its selector matches no Ready Pod."
  echo "Check: kubectl get endpoints web"
  echo "Check: kubectl get pods -l app=web"
  exit 1
fi

echo "Service 'web' is live with endpoints: $ips"
exit 0
