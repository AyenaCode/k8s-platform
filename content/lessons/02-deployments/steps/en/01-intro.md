## Why Deployments?

A bare Pod is fragile: delete it and it's gone. Real workloads use a **Deployment** — declare a desired state, and Kubernetes drives reality to match it, forever.

A Deployment gives you four superpowers:

- **Desired state** — *"I want 3 replicas of nginx"*; Kubernetes enforces it continuously.
- **Self-healing** — a Pod crashes, a node dies? A replacement appears automatically.
- **Scaling** — change one number to run more or fewer copies instantly.
- **Rolling updates & rollback** — ship a new image with zero downtime; undo in one command.

### The ownership chain

```text
Deployment
  └─owns─▶ ReplicaSet
             └─owns─▶ Pod(s)
(you edit)   (auto-created)  (containers)
```

You interact with the **Deployment** only. It creates a **ReplicaSet** whose sole job is "keep exactly N Pods alive." When you update the image, the Deployment creates a *new* ReplicaSet and shifts Pods over gradually — that's a rolling update.

> [!NOTE]
> `apps/v1` is the stable API group for Deployments (and ReplicaSets).
> You'll see `deployment.apps/web` in `kubectl get` output — that's normal.

In this lesson you'll create a Deployment, scale it, watch it self-heal, then roll out a new version and explore rollback — all in the live terminal.

**Continue →**
