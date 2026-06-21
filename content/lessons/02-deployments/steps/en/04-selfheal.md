## Watch Self-Healing in Action

Kubernetes runs a constant reconcile loop: it compares "what is" with "what you asked for" and acts to close the gap. Delete a Pod and the ReplicaSet notices within milliseconds and schedules a replacement.

### Drills

**1. Get a running Pod name:**

```bash
kubectl get pods -l app=web
```

**2. Delete one Pod** (this command picks the first one automatically):

```bash
kubectl delete $(kubectl get pod -l app=web -o name | head -1)
```

**3. List again immediately** (a replacement is already being scheduled):

```bash
kubectl get pods -l app=web
```

You should see the count drop to 4 for a split second, then a new Pod appear in `ContainerCreating`.

> [!IMPORTANT]
> This is the **reconcile loop**: observe, diff, act.
> The ReplicaSet controller saw `current=4 < desired=5` and created a fresh Pod within milliseconds. The same loop reschedules Pods when a whole node fails.

> [!WARNING]
> A bare Pod (created with `kubectl run`, no Deployment) is **not** recreated when deleted. Only objects owned by a controller get this superpower.

This step is observation only. No verification needed. **Continue →**
