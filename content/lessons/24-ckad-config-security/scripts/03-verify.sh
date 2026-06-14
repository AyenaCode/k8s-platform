#!/bin/bash
set -uo pipefail

ns=ckad-sec

quota_cpu=$(kubectl get resourcequota compute-quota -n "$ns" -o jsonpath='{.spec.hard.requests\.cpu}' 2>/dev/null)
quota_mem=$(kubectl get resourcequota compute-quota -n "$ns" -o jsonpath='{.spec.hard.limits\.memory}' 2>/dev/null)
limit_mem=$(kubectl get limitrange container-defaults -n "$ns" -o jsonpath='{.spec.limits[0].default.memory}' 2>/dev/null)
limit_cpu=$(kubectl get limitrange container-defaults -n "$ns" -o jsonpath='{.spec.limits[0].default.cpu}' 2>/dev/null)
request_mem=$(kubectl get limitrange container-defaults -n "$ns" -o jsonpath='{.spec.limits[0].defaultRequest.memory}' 2>/dev/null)
request_cpu=$(kubectl get limitrange container-defaults -n "$ns" -o jsonpath='{.spec.limits[0].defaultRequest.cpu}' 2>/dev/null)
available=$(kubectl get deploy limited-api -n "$ns" -o jsonpath='{.status.availableReplicas}' 2>/dev/null)
cpu_req=$(kubectl get deploy limited-api -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].resources.requests.cpu}' 2>/dev/null)
mem_req=$(kubectl get deploy limited-api -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].resources.requests.memory}' 2>/dev/null)
mem_limit=$(kubectl get deploy limited-api -n "$ns" -o jsonpath='{.spec.template.spec.containers[0].resources.limits.memory}' 2>/dev/null)

if [ "$quota_cpu" != "1" ] || [ "$quota_mem" != "1Gi" ]; then
  echo "x ResourceQuota compute-quota must set requests.cpu=1 and limits.memory=1Gi."
  exit 1
fi
if [ "$limit_mem" != "128Mi" ] || [ "$request_mem" != "64Mi" ] || [ "$limit_cpu" != "200m" ] || [ "$request_cpu" != "50m" ]; then
  echo "x LimitRange container-defaults must default cpu 200m/50m and memory 128Mi/64Mi (limit/request)."
  exit 1
fi
if [ "${available:-0}" -lt 2 ] 2>/dev/null || [ "$cpu_req" != "100m" ] || [ "$mem_req" != "64Mi" ] || [ "$mem_limit" != "128Mi" ]; then
  echo "x limited-api must have 2 available replicas with cpu 100m, memory request 64Mi, memory limit 128Mi."
  exit 1
fi

echo "OK: quota, LimitRange (cpu+memory defaults), and limited-api resource requirements are correct."
