## Claim storage that survives the Pod

A PVC is your request for a storage locker. Once a Pod mounts it, the locker
is provisioned and bound. Delete the Pod and the locker stays; only deleting
the PVC destroys the data.

Your mission: prove that data written into a mounted PVC survives a Pod
deletion and recreation.

### 🎯 Mission

| Object | Name | Key fields |
|--------|------|------------|
| PersistentVolumeClaim | `data-pvc` | 1 Gi, `ReadWriteOnce` |
| Pod | `writer` | image `busybox:1.36`, mounts `data-pvc` at `/data` |
| Proof | file `/data/hello.txt` | must contain `persisted` after Pod recreate |

Steps to reach that state:
1. Apply the PVC.
2. Apply a Pod named `writer` that mounts it at `/data`.
3. Write the string `persisted` into `/data/hello.txt` via `kubectl exec`.
4. Delete the Pod, recreate it with the same PVC, read the file back.

### 🔍 How to find it yourself

Start by exploring the fields you need:

```bash
kubectl explain persistentvolumeclaim.spec
kubectl explain persistentvolumeclaim.spec.accessModes
kubectl explain pod.spec.volumes --recursive
kubectl explain pod.spec.containers.volumeMounts
```

To write to and read from the running Pod:

```bash
kubectl exec <pod> -- sh -c "echo persisted > /data/hello.txt"
kubectl exec <pod> -- cat /data/hello.txt
```

To watch the PVC go from Pending to Bound once the Pod is scheduled:

```bash
kubectl get pvc data-pvc
kubectl describe pvc data-pvc
```

> [!TIP]
> **PVC stays Pending?** That is expected until a Pod that references it is
> scheduled. `local-path` uses `WaitForFirstConsumer` binding mode. Apply your
> `writer` Pod and the PVC will bind automatically.

📖 Docs: [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) · [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/)

When `data-pvc` is **Bound** and `/data/hello.txt` reads `persisted`, hit **Verify**. ✅
