## Attach a HorizontalPodAutoscaler to a Deployment

The platform pre-created **`web-hpa`**: a Deployment with a **100m CPU request**
already set. That request is the denominator the HPA divides by; without it the
autoscaler is blind.

### Your task

**1. Confirm the Deployment is ready and metrics are flowing.**

```bash
kubectl get deploy web-hpa
kubectl top pods -l app=web-hpa
```

> [!NOTE]
> If `kubectl top pods` returns `<unknown>` wait ~15 s and retry: metrics-server
> scrapes on a short interval.

**2. Attach the autoscaler.** Target **50% average CPU**, between **1 and 5** replicas:

```bash
kubectl autoscale deployment web-hpa --cpu=50% --min=1 --max=5
```

**3. Watch the HPA until TARGETS shows a real percentage.**

```bash
kubectl get hpa web-hpa -w
```

What good looks like:

```text
NAME      REFERENCE             TARGETS          MINPODS  MAXPODS  REPLICAS
web-hpa   Deployment/web-hpa   cpu: <unknown>/50%   1        5        1   ← first ~30s
web-hpa   Deployment/web-hpa   cpu: 0%/50%          1        5        1   ← live metrics
```

`cpu: 0%/50%` means current 0%, target 50%. The app is idle, so 1 replica is
enough. Under real load the HPA raises REPLICAS toward `max`, then scales back
down once the burst ends.

> [!TIP]
> **Generate load to watch it scale:** exec a busy loop directly inside the
> `web-hpa` pod so the HPA sees its CPU rise
> (`kubectl exec deploy/web-hpa -- sh -c "while true; do :; done"`),
> then watch `kubectl get hpa -w` climb REPLICAS. Scale-down is deliberately
> slow (a stabilization window) to prevent flapping.

> [!WARNING]
> `<unknown>` that never clears means the Pods lack a CPU request. The setup
> script already sets `requests.cpu: 100m` on `web-hpa`, so this should not
> happen, but if it does, check `kubectl describe hpa web-hpa` for the cause.

**4. Confirm the HPA is healthy.**

```bash
kubectl describe hpa web-hpa | grep -i "metrics\|able to"
```

When TARGETS reads a **real `%/50%`** (not `<unknown>`), then hit **Verify**. ✅
