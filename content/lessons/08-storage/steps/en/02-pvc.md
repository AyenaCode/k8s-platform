## Claim storage that survives the Pod

Create a PersistentVolumeClaim asking for 1Gi:

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

Check it — it is **`Pending`**, and that is expected:

```bash
kubectl get pvc data-pvc
# STATUS: Pending   (WaitForFirstConsumer — waiting for a Pod to use it)
```

Now create a Pod that **mounts** the claim at `/data`. The moment it is scheduled,
the volume is provisioned and the PVC turns **`Bound`**:

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
kubectl get pvc data-pvc        # STATUS: Bound
```

Write a file into the volume:

```bash
kubectl exec writer -- sh -c "echo persisted > /data/hello.txt"
```

**Prove it survives.** Delete the Pod, recreate it, and the file is still there —
because the data lives on the PVC, not the Pod:

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
kubectl exec writer -- cat /data/hello.txt      # -> persisted  (it survived!)
```

When the PVC is **Bound** and `/data/hello.txt` reads **`persisted`**, click
**Verify**. ✅
