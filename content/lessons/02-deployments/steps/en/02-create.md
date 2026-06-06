## Create a Deployment

One command creates a Deployment, a ReplicaSet, and three Pods — all wired together.

### Your task

**1. Create the Deployment** named `web` with 3 nginx replicas:

```bash
kubectl create deployment web --image=nginx --replicas=3
```

**2. Watch the full ownership chain appear:**

```bash
kubectl get deploy,rs,pods
```

What good looks like:

```text
NAME                  READY   UP-TO-DATE   AVAILABLE
deployment.apps/web   3/3     3            3

NAME                          DESIRED   CURRENT   READY
replicaset.apps/web-74d9c     3         3         3

NAME                    READY   STATUS
pod/web-74d9c-aaaa      1/1     Running
pod/web-74d9c-bbbb      1/1     Running
pod/web-74d9c-cccc      1/1     Running
```

> [!NOTE]
> Pod names follow the pattern `web-<replicaset-hash>-<random>`.
> The Deployment created the ReplicaSet; the ReplicaSet created the Pods.
> You'll never need to touch the ReplicaSet directly.

> [!TIP]
> **Pods still in `ContainerCreating`?** The node is pulling the `nginx` image
> for the first time. Wait a few seconds and re-run the command — it clears on its own.

When `web` shows **3/3 ready**, then hit **Verify**. ✅
