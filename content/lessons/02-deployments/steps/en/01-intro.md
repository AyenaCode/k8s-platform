## Why Deployments?

You saw that a bare Pod is fragile — delete it and it's gone for good. Real
workloads use a **Deployment**, which gives you:

- **Desired state** — you declare *"I want 3 replicas of nginx"* and Kubernetes
  continuously makes reality match.
- **Self-healing** — a Pod crashes or its node dies? A new one is created.
- **Scaling** — change one number to run more or fewer copies.
- **Rolling updates & rollback** — ship a new image with zero downtime, and undo
  instantly if it goes wrong.

The chain of objects:

```
Deployment  ──manages──▶  ReplicaSet  ──manages──▶  Pods
 (you edit this)          (auto-created)            (the running containers)
```

You almost always interact with the **Deployment**. It creates a **ReplicaSet**,
whose only job is to keep exactly N Pods alive. When you update the image, the
Deployment creates a *new* ReplicaSet and shifts Pods over gradually.

In this lesson you'll create one, scale it, watch it heal itself, then roll out a
new version — all in the live terminal on the right.
