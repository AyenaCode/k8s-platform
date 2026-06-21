## The big picture: control plane + nodes

A Kubernetes cluster is a group of machines split into two roles: the **brain**
that decides, and the **muscle** that runs your containers.

```text
   CONTROL PLANE · the brain
   ────────────────────────────────────
   kubectl ─▶ kube-apiserver ─▶ etcd
              scheduler · controller-mgr
                     │
                     ▼  schedules a Pod onto…
   WORKER NODES · the muscle
   ────────────────────────────────────
   node ▸ kubelet · kube-proxy · runtime
   node ▸ [Pod] [Pod] … [Pod]
```

- The **control plane** makes global decisions and stores the truth.
- The **worker nodes** run your actual containers, inside Pods.

### The reconciliation loop

Everything runs on one simple loop, repeated forever:

```text
   observe ─▶ compare ─▶ act ─▶ repeat ↻
   current    vs desired  close the gap
```

You write the **desired state** ("3 replicas"). A **controller** watches the
current state, sees only 2 running, and creates 1 more. A node dies? The loop
notices and reschedules elsewhere. It never stops.

> [!TIP]
> Remember this: **declare desired state → controllers reconcile → repeat.**
> Almost every Kubernetes behaviour is a variation of this one idea.

📖 Docs: [Command line tool (kubectl)](https://kubernetes.io/docs/reference/kubectl/)
