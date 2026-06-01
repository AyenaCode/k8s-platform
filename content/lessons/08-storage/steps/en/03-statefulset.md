## StatefulSets: stable names & disks

A Deployment's Pods are **interchangeable** — random names, shared nothing,
created in any order. That is wrong for databases and clusters, where each member
needs a **stable identity** and **its own disk** that follows it across restarts.

That is a **StatefulSet**. It gives you:

- **Stable, ordered names**: `web-0`, `web-1`, … (not random suffixes).
- **Stable per-Pod storage**: each replica gets its own PVC from a
  `volumeClaimTemplate` — `data-web-0`, `data-web-1`. Delete `web-0`, it comes
  back as `web-0` re-attached to `data-web-0`.
- **Ordered rollout**: `web-0` becomes Ready before `web-1` starts.

A StatefulSet needs a **headless Service** (`clusterIP: None`) to give each Pod a
stable DNS name. Apply both:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None          # headless: DNS resolves to each Pod, no load-balancing
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
  serviceName: db          # must match the headless Service above
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
      name: data           # produces PVCs: data-web-0, data-web-1
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
EOF
```

Watch the **ordered** creation — `web-0` first, then `web-1`:

```bash
kubectl get pods -l app=db -w        # web-0 Ready, then web-1 appears; Ctrl-C
kubectl rollout status statefulset/web --timeout=120s
```

See the one PVC **per Pod**, each Bound:

```bash
kubectl get pvc
# data-web-0   Bound ...
# data-web-1   Bound ...
```

Each Pod also has a stable DNS name: `web-0.db`, `web-1.db`.

When the StatefulSet shows **2/2 ready** and PVCs **`data-web-0`** and
**`data-web-1`** are **Bound**, click **Verify**. ✅
