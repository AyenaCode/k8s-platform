## What is a Pod?

A **Pod** is the smallest thing you can deploy in Kubernetes. It wraps **one or
more containers** that always run together, on the same node, sharing:

- the same **network** (one IP, the containers reach each other on `localhost`)
- the same **storage volumes**

> Think of a Pod as a *logical host* for a tightly-coupled set of containers.
> 99% of the time you'll run **one container per Pod**.

You almost never create Pods by hand in production — a **Deployment** does it for
you (next lesson). But understanding the Pod is the foundation for everything else.

A few facts to keep in mind:

- A Pod is **ephemeral**: if it dies, it is *not* automatically recreated (that's
  the Deployment's job). Its name and IP are not stable.
- Each Pod gets its **own IP** inside the cluster network.
- The container image is pulled and started by the **kubelet** on the node.

In the next step you'll create a real Pod in your live cluster — the terminal on
the right is a full shell with `kubectl` already connected. Try it now:

```bash
kubectl get pods
kubectl get nodes
```
