## Scale the Deployment

Scaling means changing the desired replica count. The Deployment tells the ReplicaSet to adjust; the ReplicaSet creates or removes Pods right away. Think of it like telling a manager "hire 2 more people": the manager handles who and when.

### 🎯 Mission

| Field    | Value |
|----------|-------|
| Deployment | `web` |
| Replicas | `5` (all Running) |

### 🔍 How to find it yourself

There is a `kubectl` verb designed exactly for changing replica counts:

```bash
kubectl scale --help
```

Read the SYNOPSIS line. It tells you the resource type, resource name, and the flag you need.

Check the result afterward:

```bash
kubectl get pods -l app=web
kubectl get deployment web
```

> [!TIP]
> Scaling down works the same way: point to a smaller number and Kubernetes terminates the extra Pods cleanly.

📖 Docs: [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When all **5 replicas are ready**, hit **Verify**. ✅
