# TICKET-010 : Application that never starts

## Incident Report

**From** : Platform team
**Urgency** : High
**Time** : 15:30

> "We deployed a new version of the e-commerce backend.
> The pod has been stuck in a weird status 'Init:0/1' for 20 minutes.
> The main container hasn't even started running.
> We don't understand, it was fine last week."

## Your mission

The pod must move to Running and the service must respond.

> Note: there is a missing dependency. You will need to create a resource
> to unblock the startup. No need to touch the existing Deployment.

## Deployment

```bash
./ticket-010/deploy.sh
```

## Validation criteria

```bash
# 1. Pod in Running, READY 1/1
kubectl get pods -n exo-010

# 2. Service responds
kubectl run test --image=busybox --rm -it --restart=Never -n exo-010 -- wget -qO- http://app-svc:80
# Should display HTML
```

## Hint (if you're stuck)

`Init:0/1` means an init container is still running (or failing)
and the main container has not started. To see its logs:

```bash
kubectl logs <pod> -n exo-010 -c <init-container-name>
```

The init container name can be found in `kubectl describe pod`.
