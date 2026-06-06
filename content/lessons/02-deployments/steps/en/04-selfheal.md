## Watch Self-Healing in Action

The desired-state model means Kubernetes constantly reconciles "what is" with "what you asked for." Delete a Pod and the cluster fills the gap in milliseconds: no human intervention needed.

### Drills

**1. Note a running Pod name:**

```bash
kubectl get pods -l app=web
```

**2. Delete one Pod** (the command below picks the first Pod automatically):

```bash
kubectl delete "$(kubectl get pod -l app=web -o name | head -1)"
```

**3. Immediately list again (a replacement is already being scheduled):**

```bash
kubectl get pods -l app=web
```

What good looks like:

```text
NAME                READY   STATUS              AGE
web-74d9c-aaaa      1/1     Running             4m
web-74d9c-bbbb      1/1     Running             4m
web-74d9c-cccc      1/1     Running             4m
web-74d9c-dddd      1/1     Running             4m
web-74d9c-ffff      0/1     ContainerCreating   1s  ← new
```

> [!IMPORTANT]
> This is the **reconcile loop**: observe → diff → act.
> The ReplicaSet controller saw `current=4 < desired=5` and created a fresh Pod
> within milliseconds. This same loop reschedules Pods when a node fails.
> You declare *what* you want: Kubernetes relentlessly enforces it.

> [!WARNING]
> A **bare Pod** (created with `kubectl run`, no Deployment) is **not** recreated
> when deleted. Only objects owned by a controller (Deployment → ReplicaSet) heal.

This step is observation only: no verification needed. **Continue →**
