## Create a Deployment

One command creates a Deployment, a ReplicaSet, and three Pods, all wired together. You need to find that command yourself: that is the whole point.

### 🎯 Mission

| Field    | Value  |
|----------|--------|
| Kind     | Deployment |
| Name     | `web` |
| Image    | `nginx` |
| Replicas | `3` (all `Running`, READY `1/1`) |

### 🔍 How to find it yourself

You want to *create* something. What `kubectl` verb creates a Deployment imperatively? Start here:

```bash
kubectl create --help           # list sub-resources you can create
kubectl create deployment --help  # read the SYNOPSIS and first examples
```

The help shows you every flag you need. Build your own line from that.

After you create it, inspect the full ownership chain:

```bash
kubectl get deploy,rs,pods
kubectl describe deployment web
```

> [!TIP]
> Pods stuck on `ContainerCreating`? The image is downloading for the first time. Wait a few seconds and check again. That is normal.

📖 Docs: [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `web` shows **3/3 ready**, hit **Verify**. ✅
