## Persistent and ephemeral volumes

CKAD expects you to know the difference between scratch storage and durable
storage. `emptyDir` disappears with the Pod. A PVC survives Pod replacement.

### Your task

In namespace **`ckad-design`**:

1. Create PVC **`ckad-data`** requesting `1Mi`.
2. Create Pod **`volume-worker`** with image `busybox:1.36` and command `sleep 3600`.
3. Mount the PVC at **`/data`**.
4. Mount an `emptyDir` volume named **`cache`** at **`/cache`**.

Example PVC:

```bash
kubectl apply -f - <<'YAML'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ckad-data
  namespace: ckad-design
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Mi
YAML
```

Then create the Pod manifest and wait until it is Running.
