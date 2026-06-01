#!/bin/bash
# Pass when an Ingress routes host "site.local" to a backend AND a request with
# that Host header actually returns HTTP 200 through Traefik on localhost:80.
set -uo pipefail

host=$(kubectl get ingress site -o jsonpath='{.spec.rules[0].host}' 2>/dev/null)
if [ -z "$host" ]; then
  echo "✗ No Ingress 'site' with a host rule. Create one for host 'site.local' -> site-svc:80."
  exit 1
fi
if [ "$host" != "site.local" ]; then
  echo "✗ Ingress 'site' routes host '$host', expected 'site.local'."
  exit 1
fi

# The real proof: a Host-routed request reaches the nginx backend through Traefik.
# Traefik may take a few seconds to load a new Ingress, so retry briefly.
code=""
for i in $(seq 1 8); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 -H "Host: site.local" localhost:80 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 2
done

if [ "$code" = "200" ]; then
  echo "✓ Ingress works: curl -H 'Host: site.local' localhost returned 200 via Traefik -> site-svc."
  exit 0
fi

echo "✗ Request with Host 'site.local' returned '$code' (expected 200)."
echo "  Check the Ingress backend points to site-svc:80 and the Service has endpoints."
exit 1
