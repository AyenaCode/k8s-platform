## Launch your first Pod

Time to put a real workload on the cluster: a single nginx Pod named **`web`**.

### Your task

**1. Create the Pod.** In the terminal:

```bash
kubectl run web --image=nginx
```

The scheduler places it on a node; the kubelet pulls `nginx` and starts it.

**2. Watch it come up** until it reports `Running`:

```bash
kubectl get pods -w        # live updates, Ctrl-C to stop
```

What "good" looks like:

```
NAME   READY   STATUS    RESTARTS   AGE
web    1/1     Running    0         20s
```

- `READY 1/1`: the container is up and passing its checks.
- `STATUS Running`: the process started.

> [!TIP]
> **Stuck on `ContainerCreating`?** The image is still downloading on first pull.
> Give it a few seconds and watch again. That's normal, not an error.

When `web` is **Running**, hit **Verify**. ✅
