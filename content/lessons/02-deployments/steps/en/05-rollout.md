## Roll Out a New Image and Roll Back

Updating a running app without downtime is called a rolling update. Kubernetes starts new Pods with the new image before stopping old ones, so traffic never drops. You need to find the right command yourself.

### 🎯 Mission

| Field      | Value        |
|------------|--------------|
| Deployment | `web`        |
| New image  | `nginx:1.27` |
| Rollout    | fully finished (all replicas ready) |

### 🔍 How to find it yourself

You need to update the image on a running Deployment. There are two ways to discover the right command:

```bash
kubectl set --help          # list what "set" can modify
kubectl set image --help    # read the SYNOPSIS: resource, container=image
```

The SYNOPSIS shows you the shape: `kubectl set image <resource> <container>=<new-image>`. To find the container name used inside `web`:

```bash
kubectl get deployment web -o yaml | grep -A2 "containers:"
```

After you trigger the update, watch it progress:

```bash
kubectl rollout status deployment/web
kubectl rollout history deployment/web
```

> [!TIP]
> Want to practice rollback? After the rollout finishes, run `kubectl rollout undo deployment/web` to flip back. Then check `rollout history` again to see both revisions.

> [!NOTE]
> Under the hood, `set image` creates a new ReplicaSet for the new version and scales it up while the old one scales down. `maxSurge` and `maxUnavailable` in `deployment.spec.strategy.rollingUpdate` control the pace. Try `kubectl explain deployment.spec.strategy.rollingUpdate`.

📖 Docs: [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When the rollout is **complete** with image `nginx:1.27`, hit **Verify**. ✅
