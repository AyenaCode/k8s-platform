## Create your first Pod

Let's run a single nginx Pod named **`web`**. In the terminal on the right:

```bash
kubectl run web --image=nginx
```

Kubernetes pulls the `nginx` image and schedules the Pod onto a node. Watch it
come up:

```bash
kubectl get pods
# NAME   READY   STATUS              RESTARTS   AGE
# web    0/1     ContainerCreating   0          3s

kubectl get pods -w        # live updates; Ctrl-C to stop
```

Wait until it reaches:

```
web    1/1     Running   0    20s
```

- `READY 1/1` → the single container is up.
- `STATUS Running` → the container process started.

> If it's stuck on `ContainerCreating`, the image is still downloading — give it
> a few seconds.

When your Pod is **Running**, click **Verify** below to earn XP. ✅
