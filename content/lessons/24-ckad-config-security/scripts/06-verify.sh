#!/bin/bash
set -uo pipefail

crd=widgets.ckad.dev
ns=ckad-sec

group=$(kubectl get crd "$crd" -o jsonpath='{.spec.group}' 2>/dev/null)
kind=$(kubectl get crd "$crd" -o jsonpath='{.spec.names.kind}' 2>/dev/null)
plural=$(kubectl get crd "$crd" -o jsonpath='{.spec.names.plural}' 2>/dev/null)
scope=$(kubectl get crd "$crd" -o jsonpath='{.spec.scope}' 2>/dev/null)
version=$(kubectl get crd "$crd" -o jsonpath='{.spec.versions[0].name}' 2>/dev/null)
size_type=$(kubectl get crd "$crd" -o jsonpath='{.spec.versions[0].schema.openAPIV3Schema.properties.spec.properties.size.type}' 2>/dev/null)
size=$(kubectl get widget sample -n "$ns" -o jsonpath='{.spec.size}' 2>/dev/null)

if [ "$group" != "ckad.dev" ] || [ "$kind" != "Widget" ] || [ "$plural" != "widgets" ] || [ "$scope" != "Namespaced" ] || [ "$version" != "v1" ] || [ "$size_type" != "string" ]; then
  echo "x CRD widgets.ckad.dev must define namespaced Widget v1 with spec.size string."
  exit 1
fi
if [ "$size" != "small" ]; then
  echo "x Widget sample in namespace ckad-sec must set spec.size=small."
  exit 1
fi

echo "OK: CRD widgets.ckad.dev and Widget sample are present."
