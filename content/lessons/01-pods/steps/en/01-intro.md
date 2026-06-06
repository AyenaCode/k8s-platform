## What is a Pod?

A **Pod** is the smallest unit you deploy in Kubernetes: a wrapper around **one or
more containers** that always run together on one node and share:

- one **network identity** — a single Pod IP; containers talk over `localhost`
- the same **storage volumes**

> [!NOTE]
> Run one container per Pod ~99% of the time. A Pod is *ephemeral* — if it dies it
> is **not** recreated (a Deployment does that, next mission), and its name and IP
> are not stable. The **kubelet** on the node pulls the image and starts the container.

You rarely create Pods by hand in production — but every higher-level object
(Deployments, Jobs, StatefulSets) ultimately runs Pods. Master this and the rest
falls into place.

### Recon

The terminal on the right is a real shell with `kubectl` already wired to a live
cluster. Survey it:

```bash
kubectl get nodes      # the machines that run your workloads
kubectl get pods       # what's running right now (probably nothing yet)
```

Next, you'll put a Pod on one of those nodes. **Continue →**
