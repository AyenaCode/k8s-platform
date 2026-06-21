## The worker nodes: the muscle

Every machine that runs your workloads carries three pieces:

| Component | What it does |
|---|---|
| **kubelet** | The node agent. Takes Pod specs from the API server and makes sure those containers are running and healthy, then reports status back. |
| **kube-proxy** | Programs the node's network rules so traffic to a **Service** reaches the right Pods, wherever they run. |
| **container runtime** | The engine that actually runs containers: **containerd** or CRI-O, via the CRI interface. (Docker-the-engine was removed in v1.24.) |

```text
   API server
      │  sends a Pod spec
      ▼
   kubelet ─▶ runtime ─▶ [ container ]
      │
      ▲── reports health & status back up
```

> [!TIP]
> Think of the **kubelet** as the node's foreman. It doesn't decide *what* to
> run (the control plane does), it just carries out the orders and reports back.

Put it all together and the full request flow is:

**you** → `kubectl` → **API server** → **etcd** (stored) → **scheduler** picks a
node → **kubelet** on that node → **runtime** starts the container. Then the
**control loop** keeps watching forever.

Explore your nodes with:

```bash
kubectl get nodes -o wide
```

📖 Docs: [Pods](https://kubernetes.io/docs/concepts/workloads/pods/) · [Command line tool (kubectl)](https://kubernetes.io/docs/reference/kubectl/)
