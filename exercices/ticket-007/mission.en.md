# TICKET-007 : Cache crashing in a loop

## Incident Report

**From** : Backend team
**Urgency** : High
**Time** : 03:42 (night)

> "Our cache Redis keeps restarting every 20 seconds. The pods go from
> Running to Error and then start again. We checked the image, it's the right one.
> The logs show nothing abnormal on the application side.
> The microservices that depend on the cache are starting to collapse."

## Your mission

The Redis pods must be Running and stable (0 restarts for 1 minute).
The service must accept connections.

## Deployment

```bash
./ticket-007/deploy.sh
```

## Validation criteria

```bash
# 1. Pods stable
kubectl get pods -n exo-007
# RESTARTS must stay at 0 or stop increasing

# 2. The service responds (Redis will return a protocol error on HTTP, that's normal)
kubectl run test --image=busybox --rm -it --restart=Never -n exo-007 -- nc -zv cache-svc 6379
# Should display "open"
```

## Hint (if you're stuck)

The app-side logs are empty because the app doesn't have time to log anything.
When a pod dies without saying anything, `describe pod` often reveals a `Last State`
with a specific reason. Read it carefully.
