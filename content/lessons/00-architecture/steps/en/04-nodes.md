## The worker nodes — the muscle

Every machine that runs your workloads carries three pieces:

| Component | What it does |
|---|---|
| **kubelet** | The node agent. Takes Pod specs from the API server and makes sure those containers are actually running and healthy — then reports status back. |
| **kube-proxy** | Programs the node's network rules (iptables / IPVS) so traffic to a **Service** reaches the right Pods, wherever they run. |
| **container runtime** | The engine that actually runs containers — **containerd** or CRI-O, via the CRI interface. (Docker-the-engine was removed in v1.24.) |

```text
   API server
      │  sends a Pod spec
      ▼
   kubelet ─▶ runtime ─▶ [ container ]
      │
      ▲── reports health & status back up
```

> [!TIP]
> Mental model: the **kubelet** is the node's foreman. It doesn't decide *what* to
> run — the control plane does — it just makes the orders happen and reports back.

Put it together and the full request flow is:

**you** → `kubectl` → **API server** → **etcd** (stored) → **scheduler** picks a
node → **kubelet** on that node → **runtime** starts the container. Then the
**control loop** keeps watching forever.
