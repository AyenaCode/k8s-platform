## Why Deployments?

A bare Pod is like a sticky note: tear it off and it's gone forever. A **Deployment** is more like a contract: you say "I want 3 copies of nginx running", and Kubernetes enforces that contract non-stop.

Under the hood, one Deployment creates one ReplicaSet, which creates the Pods:

```text
Deployment
  └─owns─▶ ReplicaSet
             └─owns─▶ Pod(s)
(you edit)   (auto-created)  (containers)
```

You only touch the Deployment. The ReplicaSet's only job is "keep exactly N Pods alive".

- **Self-healing**: a Pod dies, a replacement appears. No action needed.
- **Scaling**: change one number, Kubernetes adjusts the count immediately.
- **Rolling update**: swap images without downtime; undo in one command.

> [!NOTE]
> The stable API group is `apps/v1`. You will see `deployment.apps/web` in `kubectl get` output. That is normal.

Explore the resource shape before you dive in:

```bash
kubectl explain deployment --recursive
kubectl explain deployment.spec.strategy
```

📖 Docs: [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
