# TICKET-009 : Worker that never starts

## Incident Report

**From** : Data team
**Urgency** : Medium
**Time** : 10:08

> "Our job processing worker has been in CrashLoopBackOff since
> we deployed the new image. The dev swears the image works
> locally. Jobs are piling up in the queue, we already have 4000 messages
> waiting."

## Your mission

The pods must be Running and stable (no restart loop).

> Note: you will need to fix the Deployment YAML. Use `kubectl edit deploy`
> or `kubectl set` or `kubectl patch`. No other resource to create.

## Deployment

```bash
./ticket-009/deploy.sh
```

## Validation criteria

```bash
# Pods Running, READY 1/1, RESTARTS no longer increasing
kubectl get pods -n exo-009
```

## Hint (if you're stuck)

When a pod in CrashLoop starts and then dies immediately, the logs are
often the answer. `kubectl logs <pod> -n exo-009` shows the command output.
If the logs are empty, try `--previous`.
