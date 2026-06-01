## How autoscaling works

You already scaled a Deployment **by hand** with `kubectl scale`. But traffic does
not wait for a human. A **HorizontalPodAutoscaler (HPA)** scales the replica count
**automatically**, based on load.

The HPA runs a simple control loop, every ~15 seconds:

```
            current CPU usage (across pods)
utilization = ──────────────────────────────   ×  100
            CPU the pods REQUESTED

if utilization > target  → add replicas (up to maxReplicas)
if utilization < target  → remove replicas (down to minReplicas)
```

Two prerequisites make this possible:

1. **metrics-server** must be running — it supplies the live CPU/memory numbers.
   You already enabled it (this is what `kubectl top pods` reads).
2. The target Pods **must declare `resources.requests.cpu`**. The whole formula
   divides by the request — no request, no denominator. An HPA on requestless Pods
   shows `<unknown>` forever and never scales.

```
   ┌──────────── HPA ────────────┐
   │ watch CPU vs target (50%)   │
   │ adjust replicas 1 … 5       │
   └──────────────┬──────────────┘
                  ▼  scales
            Deployment web-hpa
```

> **Key idea:** you set a **target utilization** and **bounds**; the HPA finds the
> replica count that keeps you there. Set CPU requests or it cannot work.

In this lesson you will attach an HPA to a pre-built Deployment (which already has
CPU requests) and watch it start reading live metrics. →
