# TICKET-006 : Pods that never become Ready

## Incident Report

**From** : SRE Team
**Urgency** : High
**Time** : 16:20

> "We deployed a new webapp this morning. The pods show Running
> but READY stays stuck at 0/1 and never moves to 1/1.
> On top of that, the pods restart every 30 seconds.
> The service returns no response, users are seeing an error page."

## Your mission

The pods must reach Ready state 1/1 and stay stable (0 restarts in steady state).
The Service must respond.

## Deployment

```bash
./ticket-006/deploy.sh
```

## Validation criteria

```bash
# 1. Pods Running, Ready 1/1, restarts stable
kubectl get pods -n exo-006

# 2. The service responds
kubectl run test --image=busybox --rm -it --restart=Never -n exo-006 -- wget -qO- http://webapp-svc:80
# Should display HTML
```

## Hint (if you're stuck)

When a pod is `Running` but `0/1 READY`, look at the conditions and events
in `describe pod`. Look for the words "Readiness probe failed" or "Liveness probe failed".
