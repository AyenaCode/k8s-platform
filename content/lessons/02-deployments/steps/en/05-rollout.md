## Rolling update & rollback

Ship a new image with **zero downtime**. The container inside the `web`
Deployment is named `nginx` (same as the image). Update it to a pinned version:

```bash
kubectl set image deployment/web nginx=nginx:1.27
```

Watch the rollout replace Pods gradually — new ones come up *before* old ones go
down, so the app never drops:

```bash
kubectl rollout status deployment/web
```

Check history, and roll back instantly if needed:

```bash
kubectl rollout history deployment/web
kubectl rollout undo deployment/web      # back to the previous version
```

> A rolling update creates a **new ReplicaSet** and shifts Pods over a few at a
> time (controlled by `maxSurge` / `maxUnavailable`). Rollback just scales the old
> ReplicaSet back up.

Set the image to **`nginx:1.27`**, wait for the rollout to finish, then click
**Verify**. ✅
