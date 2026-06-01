#!/bin/bash
# Pass when the ConfigMap "app-config" carries LOG_LEVEL=debug AND a Pod "cm-demo"
# actually has that value injected as an environment variable (end-to-end proof).
set -uo pipefail

val=$(kubectl get configmap app-config -o jsonpath='{.data.LOG_LEVEL}' 2>/dev/null)
if [ -z "$val" ]; then
  echo "✗ No ConfigMap 'app-config' with key LOG_LEVEL. Run:"
  echo "  kubectl create configmap app-config --from-literal=LOG_LEVEL=debug --from-literal=GREETING=hello"
  exit 1
fi
if [ "$val" != "debug" ]; then
  echo "✗ ConfigMap 'app-config' has LOG_LEVEL='$val', expected 'debug'."
  exit 1
fi

phase=$(kubectl get pod cm-demo -o jsonpath='{.status.phase}' 2>/dev/null)
if [ "$phase" != "Running" ]; then
  echo "✗ Pod 'cm-demo' is not Running (phase='${phase:-missing}'). Apply the Pod from the step, then wait."
  exit 1
fi

# The real proof: the value is visible as an env var inside the container.
env_val=$(kubectl exec cm-demo -- printenv LOG_LEVEL 2>/dev/null | tr -d '\r\n')
if [ "$env_val" != "debug" ]; then
  echo "✗ Pod 'cm-demo' does not expose LOG_LEVEL=debug as an env var (got '${env_val:-empty}')."
  echo "  Make sure the Pod uses: envFrom: [{configMapRef: {name: app-config}}]"
  exit 1
fi

echo "✓ ConfigMap injected: cm-demo sees LOG_LEVEL=$env_val from app-config."
exit 0
