# TICKET-001 : App unreachable

## Incident Report

**From** : Frontend team
**Urgency** : High
**Time** : 09:12

> "We deployed the web app this morning. The pods seem to be running normally
> but when we try to access the Service, nothing responds. The site is
> completely down for users."

## Your mission

The app must respond via the Service. Find out why it isn't working and fix it.

## Deployment

```bash
kubectl apply -f ticket-001/
```

## Validation criteria

```bash
# From a debug pod, the app must respond:
kubectl run test --image=busybox --rm -it --restart=Never -n exo-001 -- wget -qO- http://web-svc:80
# Should display HTML (nginx page)
```
