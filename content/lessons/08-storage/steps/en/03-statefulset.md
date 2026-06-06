## Deploy a StatefulSet with stable names & disks

A Deployment's Pods are **interchangeable**: random names, shared nothing,
created in any order. Databases and distributed systems need each member to have
a **stable identity** and **its own disk** that follows it across restarts. That
is a **StatefulSet**.

A StatefulSet gives you:

- **Stable, ordered names**: `web-0`, `web-1`, … (never random suffixes).
- **Per-Pod storage**: each replica gets its own PVC from a
  `volumeClaimTemplate`. `data-web-0` follows `web-0`; `data-web-1` follows
  `web-1`. Delete `web-0` and it comes back re-attached to `data-web-0`.
- **Ordered rollout**: `web-0` becomes Ready before `web-1` starts.

> [!IMPORTANT]
> A StatefulSet requires a **headless Service** (`clusterIP: None`) referenced
> in `serviceName`. This gives each Pod a stable DNS name (`web-0.db`,
> `web-1.db`). The StatefulSet will not work correctly without it.

### Your task

**1. Apply the headless Service and StatefulSet together:**

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None
  selector:
    app: db
  ports:
  - port: 80
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: db
  replicas: 2
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["sh", "-c", "sleep 3600"]
        volumeMounts:
        - name: data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
EOF
```

**2. Watch the ordered rollout**, `web-0` becomes Ready before `web-1` starts:

```bash
kubectl get pods -l app=db -w
```

```text
NAME    READY   STATUS    RESTARTS   AGE
web-0   0/1     Pending   0          2s
web-0   1/1     Running   0          10s
web-1   0/1     Pending   0          11s
web-1   1/1     Running   0          20s
```

Press Ctrl-C, then wait for the full rollout:

```bash
kubectl rollout status statefulset/web --timeout=120s
```

**3. Confirm each Pod has its own Bound PVC:**

```bash
kubectl get pvc
```

```text
NAME         STATUS   VOLUME          CAPACITY   ACCESS MODES
data-web-0   Bound    pvc-abc123…     1Gi        RWO
data-web-1   Bound    pvc-def456…     1Gi        RWO
```

> [!TIP]
> Each Pod also gets a stable DNS name via the headless Service: `web-0.db` and
> `web-1.db`. Clients inside the cluster can address each replica directly, no
> load balancer in the way.

When **StatefulSet `web` shows 2/2 ready** and PVCs **`data-web-0`** and
**`data-web-1`** are **Bound**, then hit **Verify**. ✅
