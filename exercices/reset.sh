#!/bin/bash
echo "Cleaning up all exercise resources..."
kubectl delete namespace exo-001 --ignore-not-found
kubectl delete namespace exo-002 --ignore-not-found
kubectl delete namespace exo-003 --ignore-not-found
kubectl delete namespace exo-004 --ignore-not-found
kubectl delete namespace exo-005 --ignore-not-found
kubectl delete namespace exo-006 --ignore-not-found
kubectl delete namespace exo-007 --ignore-not-found
kubectl delete namespace exo-008 --ignore-not-found
kubectl delete namespace exo-009 --ignore-not-found
kubectl delete namespace exo-010 --ignore-not-found
echo "Cleanup done. Ready for the next exercise."
