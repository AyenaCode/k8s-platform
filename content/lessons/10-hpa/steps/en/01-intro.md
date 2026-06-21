## How the HPA control loop works

Think of the **HorizontalPodAutoscaler (HPA)** as a thermostat for Pods.
Too much CPU load? It adds Pods. Load drops? It removes them.
You just set the target temperature and the min/max range.

The math behind it:

```text
util% = (CPU used across all pods / CPU requested by all pods) x 100

util% > target  -->  add replicas   (up to maxReplicas)
util% < target  -->  remove replicas (down to minReplicas)
```

Two things must be true before the HPA can work:

1. **metrics-server must be running**: it feeds live CPU numbers to the HPA controller.
2. **Pods must declare `resources.requests.cpu`**: the formula divides by the request. No request means no denominator, so the HPA shows `<unknown>` forever and never scales.

> [!NOTE]
> k3s bundles metrics-server as a built-in add-on. It is **already running** in
> this cluster: no install needed. `kubectl top pods` works out of the box.

Here is the full picture:

```text
+-------------- HPA ---------------+
| target: 50% CPU                  |
| replicas: min 1 ... max 5        |
+------------------+---------------+
                   | scales
                   v
          Deployment/web-hpa
          (cpu request: 100m)
```

> [!IMPORTANT]
> `kubectl autoscale` creates an **`autoscaling/v2`** HPA: the current stable API.
> You set a target utilization and bounds; the HPA finds the replica count that
> keeps you there.

Explore what metrics-server sees right now:

```bash
kubectl top nodes
kubectl top pods --all-namespaces
```

📖 Docs: [Horizontal Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

**Continue to the next step to put this into practice.**
