## The control plane: the brain

These components make decisions and hold the cluster's truth. You rarely touch
them directly: you talk to the **API server**, and everything else reacts.

| Component | What it does |
|---|---|
| **kube-apiserver** | The front door. *Every* `kubectl` command, every controller, every kubelet talks to this REST API. Nothing bypasses it. |
| **etcd** | The single source of truth: a key-value store holding **all** cluster state. Lose etcd, lose the cluster's memory. |
| **kube-scheduler** | Watches for new Pods with no node yet and picks the best node for each (by resources, rules, affinity). |
| **kube-controller-manager** | Runs the built-in control loops (Deployment, ReplicaSet, Node, Job…): the reconcilers that keep reality matching desired state. |
| **cloud-controller-manager** | On cloud providers: creates load balancers, attaches disks, manages node lifecycle through the cloud API. |

> [!IMPORTANT]
> The path is always: **you → API server → etcd**, then **scheduler / controllers →
> API server → nodes**. The API server is the hub *everything* passes through.

> [!NOTE]
> This lab runs **k3s**, which packs the whole control plane (API server, scheduler,
> controller-manager) into a **single process**: so you won't see separate
> `kube-apiserver` or `etcd` pods like on a kubeadm cluster. The concepts are
> identical; only the packaging differs.
