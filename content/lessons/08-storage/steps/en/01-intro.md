## Understand PV, PVC & StorageClass

A container's own disk is like a sandcastle: when the Pod dies, the sandcastle
is washed away. For anything that must survive (a database, uploaded files, a
cache you paid to build), you need a **box** that exists outside the Pod.
Kubernetes gives you three objects for that:

- **PersistentVolume (PV)**: the actual storage in the cluster (a disk, an NFS
  share, a cloud volume). Think of it as the physical locker.
- **PersistentVolumeClaim (PVC)**: your *request* for a locker of a given size
  and access mode. Your Pod mounts the claim, not the volume directly.
- **StorageClass**: a template that auto-provisions PVs on demand. This
  cluster's default class is `local-path`.

You almost never create PVs by hand. Write a PVC, the StorageClass creates a
matching PV, and the two **bind**. This is called *dynamic provisioning*.

```text
PVC (1Gi, RWO)
  │ requests
  ▼
StorageClass (local-path)
  │ creates
  ▼
PV  --binds-->  PVC
                 ^
           Pod mounts at /data
```

> [!WARNING]
> **`local-path` uses `WaitForFirstConsumer` binding mode.** A freshly applied
> PVC shows `Pending`, on purpose. The disk is created only once a Pod that
> uses the claim is scheduled onto a node. A Pending PVC is **not** a bug; it
> is waiting for a consumer.

> [!NOTE]
> The PVC is a **stable handle** to storage. Pods come and go; the PVC (and
> its data) stays until *you* delete it.

Survey the cluster's default StorageClass before moving on:

```bash
kubectl get storageclass
kubectl explain persistentvolumeclaim.spec
```

📖 Docs: [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) · [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

Next, claim storage and prove it survives a Pod restart. **Continue →**
