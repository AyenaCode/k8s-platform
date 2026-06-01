#!/bin/bash
# Pass when Pod "guaranteed-demo" was placed in the Guaranteed QoS class.
set -uo pipefail

qos=$(kubectl get pod guaranteed-demo -o jsonpath='{.status.qosClass}' 2>/dev/null)
if [ -z "$qos" ]; then
  echo "✗ No Pod 'guaranteed-demo'. Apply the Pod from the step first."
  exit 1
fi
if [ "$qos" != "Guaranteed" ]; then
  echo "✗ Pod 'guaranteed-demo' is QoS '$qos', not Guaranteed."
  echo "  Every container needs cpu AND memory set, with limits == requests."
  exit 1
fi

echo "✓ guaranteed-demo is QoS class Guaranteed (limits == requests for cpu & memory)."
exit 0
