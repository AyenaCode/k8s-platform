## PV, PVC & StorageClass

A Pod's local filesystem is **ephemeral** — delete the Pod and the data is gone.
For anything that must survive (a database, uploads, a cache you paid to build),
you need **persistent storage**. Three objects make it work:

- **PersistentVolume (PV)** — a real piece of storage in the cluster (a disk, an
  NFS share, a cloud volume).
- **PersistentVolumeClaim (PVC)** — a *request* for storage ("I need 1Gi,
  read-write"). Your Pod mounts the **claim**, not the volume directly.
- **StorageClass** — a template that **provisions PVs automatically** when a PVC
  asks. This cluster's default is `local-path`.

You almost never create PVs by hand. You write a PVC, the StorageClass creates a
matching PV on demand, and the two **bind**. This is *dynamic provisioning*.

```
PVC (1Gi, RWO)  ──asks──▶  StorageClass (local-path)  ──creates──▶  PV  ──binds──▶  PVC
       ▲
   Pod mounts the PVC at /data
```

One quirk of `local-path` to know up front: its binding mode is
**`WaitForFirstConsumer`**. The PVC stays **`Pending`** on purpose until a Pod
actually uses it — only then is the disk created (on the node where the Pod
lands). So "Pending PVC" is **not** a bug here; it is waiting for a consumer.

> **Key idea:** the PVC is a stable handle to storage. Pods come and go; the PVC
> (and its data) stays until *you* delete it.

Next: claim storage, prove it survives a Pod restart, then meet StatefulSets. →
