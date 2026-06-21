#!/bin/bash
# Pass when the ConfigMap "app-config" carries LOG_LEVEL=debug AND a Pod "cm-demo"
# actually has that value injected as an environment variable (end-to-end proof).
set -uo pipefail

val=$(kubectl get configmap app-config -o jsonpath='{.data.LOG_LEVEL}' 2>/dev/null)
if [ -z "$val" ]; then
  echo "x No ConfigMap 'app-config' with key LOG_LEVEL found."
  echo "  Hint: kubectl create configmap --help shows the --from-literal flag."
  exit 1
fi
if [ "$val" != "debug" ]; then
  echo "x ConfigMap 'app-config' has LOG_LEVEL='$val', expected 'debug'."
  echo "  Hint: check the value you passed to --from-literal."
  exit 1
fi

phase=$(kubectl get pod cm-demo -o jsonpath='{.status.phase}' 2>/dev/null)
if [ "$phase" != "Running" ]; then
  echo "x Pod 'cm-demo' is not Running (phase='${phase:-missing}')."
  echo "  Hint: kubectl explain pod.spec.containers.envFrom to see how to load a ConfigMap."
  exit 1
fi

# The real proof: the value is visible as an env var inside the container.
env_val=$(kubectl exec cm-demo -- printenv LOG_LEVEL 2>/dev/null | tr -d '\r\n')
if [ "$env_val" != "debug" ]; then
  echo "x Pod 'cm-demo' does not expose LOG_LEVEL=debug as an env var (got '${env_val:-empty}')."
  echo "  Hint: kubectl explain pod.spec.containers.envFrom.configMapRef"
  exit 1
fi

echo "v ConfigMap injected: cm-demo sees LOG_LEVEL=$env_val from app-config."
exit 0
