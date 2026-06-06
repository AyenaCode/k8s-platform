## Claim storage that survives the Pod

You're going to create a PVC, attach a Pod to it, write a file, delete the Pod,
and prove the file is still there when the Pod comes back.

### Your task

**1. Create the PVC** named `data-pvc` requesting 1 Gi:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Gi
EOF
```

**2. Check the PVC status** — it should be `Pending`:

```bash
kubectl get pvc data-pvc
```

```text
NAME       STATUS    VOLUME   CAPACITY   ACCESS MODES
data-pvc   Pending
```

> [!NOTE]
> `Pending` here is expected. `local-path` is `WaitForFirstConsumer` — the disk
> is not provisioned until a Pod actually uses the claim.

**3. Create the `writer` Pod** that mounts `data-pvc` at `/data`. The moment it
is scheduled, the volume is provisioned and the PVC turns `Bound`:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: writer
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-pvc
EOF

kubectl wait --for=condition=Ready pod/writer --timeout=60s
kubectl get pvc data-pvc
```

```text
NAME       STATUS   VOLUME         CAPACITY   ACCESS MODES
data-pvc   Bound    pvc-abc123…    1Gi        RWO
```

**4. Write a file into the volume:**

```bash
kubectl exec writer -- sh -c "echo persisted > /data/hello.txt"
```

**5. Prove it survives.** Delete the Pod, recreate it, and read the file back —
the data lives on the PVC, not in the Pod:

```bash
kubectl delete pod writer

kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: { name: writer }
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    volumeMounts: [{ name: data, mountPath: /data }]
  volumes:
  - name: data
    persistentVolumeClaim: { claimName: data-pvc }
EOF

kubectl wait --for=condition=Ready pod/writer --timeout=60s
kubectl exec writer -- cat /data/hello.txt
```

```text
persisted
```

> [!TIP]
> The file survived because `data-pvc` was never deleted. Delete the *PVC* and
> the data is gone — the Pod is irrelevant to durability.

When `data-pvc` is **Bound** and `/data/hello.txt` reads **`persisted`**, then
hit **Verify**. ✅
