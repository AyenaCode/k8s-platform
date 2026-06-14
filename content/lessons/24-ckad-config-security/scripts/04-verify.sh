#!/bin/bash
set -uo pipefail

ns=ckad-sec

if ! kubectl get sa reader -n "$ns" >/dev/null 2>&1; then
  echo "x ServiceAccount reader is missing."
  exit 1
fi

can_list=$(kubectl auth can-i list pods -n "$ns" --as=system:serviceaccount:${ns}:reader 2>/dev/null)
can_delete=$(kubectl auth can-i delete pods -n "$ns" --as=system:serviceaccount:${ns}:reader 2>/dev/null)

if [ "$can_list" != "yes" ]; then
  echo "x ServiceAccount reader must be able to list pods."
  exit 1
fi
if [ "$can_delete" != "no" ]; then
  echo "x ServiceAccount reader must not be able to delete pods."
  exit 1
fi

echo "OK: reader ServiceAccount has least-privilege pod read access."
