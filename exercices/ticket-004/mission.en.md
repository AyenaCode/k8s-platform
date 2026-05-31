# TICKET-004 : Pods in crash loop

## Incident Report

**From** : Backend team
**Urgency** : Critical
**Time** : 08:03

> "The cache service has been in CrashLoopBackOff since this morning.
> We made a configuration change last night via a ConfigMap.
> Since then, nothing starts anymore. The service is critical, other
> microservices depend on it."

## Your mission

The pods must start and the Service must respond. The configuration must be correctly injected.

## Deployment

```bash
kubectl apply -f ticket-004/
```

## Validation criteria

```bash
# 1. Pods must be Running
kubectl get pods -n exo-004
# All in Running, READY 1/1

# 2. The Service must respond
kubectl run test --image=busybox --rm -it --restart=Never -n exo-004 -- wget -qO- http://cache-svc:6379
# Must receive a response (even a protocol error = OK, that means Redis is running)
```
