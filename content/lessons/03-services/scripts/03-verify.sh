#!/bin/bash
# Pass when a NodePort Service "web-np" exists and actually serves traffic on
# localhost:<nodePort> (the app shares the node's network namespace).
set -uo pipefail

typ=$(kubectl get svc web-np -o jsonpath='{.spec.type}' 2>/dev/null)
if [ -z "$typ" ]; then
  echo "No Service named 'web-np' found. Check: kubectl get svc"
  echo "Hint: use 'kubectl expose --help' and look for the --type and --name flags."
  exit 1
fi
if [ "$typ" != "NodePort" ]; then
  echo "Service 'web-np' is type '$typ', expected NodePort."
  echo "Check: kubectl explain service.spec.type"
  exit 1
fi

port=$(kubectl get svc web-np -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "localhost:$port" 2>/dev/null)

if [ "$code" = "200" ]; then
  echo "NodePort 'web-np' on port $port returned HTTP 200: reachable from outside!"
  exit 0
fi

echo "curl localhost:$port returned '$code' (expected 200)."
echo "Check: kubectl get pods -l app=web"
echo "Check: kubectl get endpoints web-np"
exit 1
