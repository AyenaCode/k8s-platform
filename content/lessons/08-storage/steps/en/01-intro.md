## Understand PV, PVC & StorageClass

A Pod's local filesystem is **ephemeral** — delete the Pod and the data is gone.
For anything that must survive (a database, uploaded files, a cache you paid to
build), you need **persistent storage**. Three objects make it work:

- **PersistentVolume (PV)** — a real piece of storage in the cluster (a disk, an
  NFS share, a cloud volume).
- **PersistentVolumeClaim (PVC)** — a *request* for storage ("give me 1 Gi,
  read-write"). Your Pod mounts the **claim**, not the volume directly.
- **StorageClass** — a template that **auto-provisions PVs on demand** when a
  PVC asks. This cluster's default class is `local-path`.

You almost never create PVs by hand. Write a PVC, the StorageClass creates a
matching PV, and the two **bind**. This is *dynamic provisioning*.

```text
PVC (1Gi, RWO)
  │ requests
  ▼
StorageClass (local-path)
  │ creates
  ▼
PV  ──binds──▶  PVC
                 ▲
           Pod mounts at /data
```

> [!WARNING]
> **`local-path` uses `WaitForFirstConsumer` binding mode.** A freshly applied
> PVC shows `Pending` — on purpose. The disk is created only once a Pod that
> uses the claim is scheduled onto a node. A Pending PVC is **not** a bug; it
> is waiting for a consumer. You will see this in the next step.

> [!NOTE]
> The PVC is a **stable handle** to storage. Pods come and go; the PVC (and its
> data) stays until *you* delete it.

Survey the cluster's default StorageClass:

```bash
kubectl get storageclass
```

Next, claim storage and prove it survives a Pod restart. **Continue →**
