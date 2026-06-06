#!/bin/bash
# Pass when Service "site-svc" exists on port 80 with at least one ready endpoint.
set -uo pipefail

port=$(kubectl get svc site-svc -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
if [ -z "$port" ]; then
  echo "✗ No Service 'site-svc'. Run: kubectl expose deployment site --name=site-svc --port=80"
  exit 1
fi
if [ "$port" != "80" ]; then
  echo "✗ Service 'site-svc' is on port $port, expected 80."
  exit 1
fi

ips=$(kubectl get endpoints site-svc -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null)
if [ -z "$ips" ]; then
  echo "✗ Service 'site-svc' has no endpoints: its selector matches no Ready Pod."
  exit 1
fi

echo "✓ Service 'site-svc' on :80 has endpoints: $ips, ready to put an Ingress in front."
exit 0
