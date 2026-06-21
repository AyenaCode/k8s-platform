## StatefulSets: stable names & disks

A Deployment's Pods are interchangeable: random names, shared nothing. A
StatefulSet gives each member a **stable identity** and **its own disk** that
follows it across restarts. Think of it as assigning each worker a permanent
desk, not a hot-desk.

Three things you get:
- **Stable, ordered names**: `web-0`, `web-1`, never random suffixes.
- **Per-Pod storage**: each replica gets its own PVC from a
  `volumeClaimTemplate`. Delete `web-0` and it comes back re-attached to
  `data-web-0`.
- **Ordered rollout**: `web-0` becomes Ready before `web-1` starts.

### 🎯 Mission

| Object | Name | Key fields |
|--------|------|------------|
| Service (headless) | `db` | `clusterIP: None`, selector `app: db` |
| StatefulSet | `web` | 2 replicas, image `busybox:1.36`, `serviceName: db` |
| Volume per Pod | `data` (becomes `data-web-0`, `data-web-1`) | 1 Gi, `ReadWriteOnce`, mounted at `/data` |

When done, `web` must show **2/2 ready** and both PVCs must be **Bound**.

### 🔍 How to find it yourself

Explore the StatefulSet spec, especially the `volumeClaimTemplates` section:

```bash
kubectl explain statefulset.spec --recursive | head -60
kubectl explain statefulset.spec.volumeClaimTemplates
kubectl explain statefulset.spec.volumeClaimTemplates.spec
```

A StatefulSet requires a headless Service. Check what makes a Service headless:

```bash
kubectl explain service.spec.clusterIP
```

After applying, watch the ordered rollout and confirm each Pod got its own PVC:

```bash
kubectl get pods -l app=db
kubectl get pvc
kubectl rollout status statefulset/web --timeout=120s
```

> [!IMPORTANT]
> The StatefulSet references the headless Service by name via `serviceName`.
> Apply the Service **before or together with** the StatefulSet, otherwise the
> controller cannot find it.

> [!TIP]
> **Pods still Pending?** The `local-path` StorageClass provisions one volume
> per Pod. Wait for `web-0` to become Running before `web-1` starts. That
> delay is by design: ordered rollout.

📖 Docs: [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) · [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When **`web` shows 2/2 ready** and PVCs **`data-web-0`** and **`data-web-1`** are **Bound**, hit **Verify**. ✅
