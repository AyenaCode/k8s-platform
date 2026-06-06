## Understand how the HPA control loop works

Traffic spikes don't wait for a human. The **HorizontalPodAutoscaler (HPA)** adjusts
a Deployment's replica count automatically, every ~15 seconds, based on observed
load.

The math is simple:

```text
         current CPU used (across all pods)
util% = ─────────────────────────────────── × 100
         CPU the pods REQUESTED

util% > target  →  add replicas   (up to maxReplicas)
util% < target  →  remove replicas (down to minReplicas)
```

Two things must be true before the HPA can work:

1. **metrics-server must be running** — it feeds live CPU numbers to the HPA.
2. **Pods must declare `resources.requests.cpu`** — the formula divides by the
   request. No request → no denominator → HPA shows `<unknown>` forever and
   never scales.

> [!NOTE]
> k3s bundles metrics-server as a packaged add-on. It is **already running** in
> this cluster — no install needed. `kubectl top pods` works out of the box.

Here is the full picture:

```text
┌──────────── HPA ─────────────┐
│ target: 50% CPU              │
│ replicas: min 1 … max 5      │
└──────────────┬───────────────┘
               │ scales
               ▼
       Deployment/web-hpa
       (cpu request: 100m)
```

> [!IMPORTANT]
> `kubectl autoscale` creates an **`autoscaling/v2`** HPA — the current stable API.
> You set a target utilization and bounds; the HPA finds the replica count that
> keeps you there.

In the next step you will attach an HPA to a pre-built Deployment and watch it
come alive with real metrics.

**Continue →**
