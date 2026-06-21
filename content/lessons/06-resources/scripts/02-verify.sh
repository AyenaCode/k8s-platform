#!/bin/bash
# Pass when Pod "guaranteed-demo" was placed in the Guaranteed QoS class.
set -uo pipefail

qos=$(kubectl get pod guaranteed-demo -o jsonpath='{.status.qosClass}' 2>/dev/null)
if [ -z "$qos" ]; then
  echo "✗ No Pod 'guaranteed-demo'. Apply the Pod from the step first."
  exit 1
fi
if [ "$qos" != "Guaranteed" ]; then
  echo "✗ Pod 'guaranteed-demo' has QoS class '$qos'."
  echo "  Check: kubectl explain pod.spec.containers.resources -- what rule makes a pod Guaranteed?"
  exit 1
fi

echo "✓ guaranteed-demo is QoS class Guaranteed (limits == requests for cpu & memory)."
exit 0
