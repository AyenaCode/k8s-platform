#!/bin/bash
# reset.sh: wipe the learner's scratch state so they can start clean.
# Deletes every non-system namespace and clears the default namespace's resources.
# kube-system / kube-public / kube-node-lease / default are preserved (default is
# only emptied, not deleted).
set -uo pipefail

PROTECTED="kube-system kube-public kube-node-lease default kube-flannel"

echo ">> Resetting the lab cluster..."

for ns in $(kubectl get ns -o jsonpath='{.items[*].metadata.name}' 2>/dev/null); do
  keep=false
  for p in $PROTECTED; do [ "$ns" = "$p" ] && keep=true; done
  if [ "$keep" = false ]; then
    echo "   deleting namespace $ns"
    kubectl delete ns "$ns" --wait=false >/dev/null 2>&1
  fi
done

echo "   clearing resources in 'default'"
kubectl delete all --all -n default >/dev/null 2>&1
kubectl delete configmap,secret --all -n default >/dev/null 2>&1 \
  --field-selector type!=kubernetes.io/service-account-token

echo ">> Reset done. Clean slate."
