# TICKET-003 : Connection refused

## Incident Report

**From** : QA team
**Urgency** : Medium
**Time** : 11:45

> "The monitoring app is deployed, the pods show Running,
> but when we call the Service we get 'connection refused'.
> We checked, the pods are running fine. We don't understand."

## Your mission

The Service must correctly route traffic to the app. Find the problem and fix it.

## Deployment

```bash
kubectl apply -f ticket-003/
```

## Validation criteria

```bash
# The app must respond via the Service:
kubectl run test --image=busybox --rm -it --restart=Never -n exo-003 -- wget -qO- http://monitoring-svc:8080
# Should display HTML (nginx page)
```
