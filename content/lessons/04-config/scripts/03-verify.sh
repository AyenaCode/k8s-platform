#!/bin/bash
# Pass when Secret "app-secret" holds API_KEY=s3cr3t AND Pod "secret-demo" has it
# mounted as a readable file at /etc/secret/API_KEY (end-to-end proof).
set -uo pipefail

raw=$(kubectl get secret app-secret -o jsonpath='{.data.API_KEY}' 2>/dev/null)
if [ -z "$raw" ]; then
  echo "✗ No Secret 'app-secret' with key API_KEY. Run:"
  echo "  kubectl create secret generic app-secret --from-literal=API_KEY=s3cr3t"
  exit 1
fi
decoded=$(printf '%s' "$raw" | base64 -d 2>/dev/null)
if [ "$decoded" != "s3cr3t" ]; then
  echo "✗ Secret 'app-secret' API_KEY decodes to '$decoded', expected 's3cr3t'."
  exit 1
fi

phase=$(kubectl get pod secret-demo -o jsonpath='{.status.phase}' 2>/dev/null)
if [ "$phase" != "Running" ]; then
  echo "✗ Pod 'secret-demo' is not Running (phase='${phase:-missing}'). Apply the Pod from the step, then wait."
  exit 1
fi

file_val=$(kubectl exec secret-demo -- cat /etc/secret/API_KEY 2>/dev/null | tr -d '\r\n')
if [ "$file_val" != "s3cr3t" ]; then
  echo "✗ Pod 'secret-demo' has no Secret mounted at /etc/secret/API_KEY (got '${file_val:-empty}')."
  echo "  Mount the Secret as a volume at mountPath: /etc/secret."
  exit 1
fi

echo "✓ Secret mounted: secret-demo reads API_KEY from /etc/secret/API_KEY."
exit 0
