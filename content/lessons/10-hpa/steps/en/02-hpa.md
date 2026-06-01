## Attach a HorizontalPodAutoscaler

The platform pre-created a Deployment named **`web-hpa`** that already declares a
**CPU request of 100m** — the baseline the HPA needs. Click **Prepare task** if you
have not. Confirm it and that metrics are flowing:

```bash
kubectl get deploy web-hpa
kubectl top pods -l app=web-hpa        # shows live CPU — metrics-server is working
```

Now attach an autoscaler: keep average CPU near **50%**, between **1 and 5**
replicas:

```bash
kubectl autoscale deployment web-hpa --cpu=50% --min=1 --max=5
```

Look at it. For the first ~15–30s the TARGETS column reads **`<unknown>`** —
the HPA has not received a metrics sample yet. **Wait**, and it becomes a real
percentage:

```bash
kubectl get hpa web-hpa
# NAME      REFERENCE             TARGETS         MINPODS  MAXPODS  REPLICAS
# web-hpa   Deployment/web-hpa    cpu: <unknown>/50%   1    5    1     ← at first
# web-hpa   Deployment/web-hpa    cpu: 0%/50%          1    5    1     ← after ~30s
```

`cpu: 0%/50%` means *current 0%, target 50%* — the app is idle, so 1 replica is
plenty. Under real load the HPA would add replicas toward `max`.

> **Try at home:** generate CPU load (e.g. a `while true` loop in a busy pod) and
> watch `kubectl get hpa -w` raise REPLICAS, then scale back down when it stops.
> Scale-down is deliberately slow (a stabilization window) to avoid flapping.

Confirm the loop is healthy — `<unknown>` must be gone:

```bash
kubectl describe hpa web-hpa | grep -i "metrics\|able to"
```

When `web-hpa`'s TARGETS shows a **real `%/50%`** (not `<unknown>`), click
**Verify**. ✅
