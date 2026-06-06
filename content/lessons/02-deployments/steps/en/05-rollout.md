## Roll Out a New Image and Roll Back

Ship a new container image with zero downtime. Kubernetes replaces Pods a few at a time (new ones start before old ones stop), so traffic never drops.

### Your task

**1. Update the `nginx` container to a pinned version:**

```bash
kubectl set image deployment/web nginx=nginx:1.27
```

> [!NOTE]
> The container name `nginx` (before the `=`) must match what is in the Deployment's
> pod template. It was set when you ran `create deployment --image=nginx`.

**2. Watch the rollout progress Pod by Pod:**

```bash
kubectl rollout status deployment/web
```

What good looks like:

```text
Waiting for deployment "web" rollout to finish: 2 out of 5 new replicas updated...
Waiting for deployment "web" rollout to finish: 4 out of 5 new replicas updated...
deployment "web" successfully rolled out
```

**3. Inspect history and practice rollback:**

```bash
kubectl rollout history deployment/web
kubectl rollout undo deployment/web      # returns to the previous image
```

> [!TIP]
> Under the hood, `set image` creates a **new ReplicaSet** running `nginx:1.27`
> and scales it up while the old ReplicaSet scales down. `undo` reverses that:
> old ReplicaSet scales back up, new one scales to zero.
> `maxSurge` and `maxUnavailable` (in the Deployment spec) control the pace.

> [!WARNING]
> `--record` (e.g., `kubectl apply --record`) is **deprecated**: do not use it.
> Use `kubectl annotate` or rely on `rollout history` without it.

Set the image to **`nginx:1.27`**, wait for the rollout to finish, then hit **Verify**. ✅
