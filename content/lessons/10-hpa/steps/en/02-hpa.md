## Attach a HorizontalPodAutoscaler to a Deployment

The setup script pre-created **`web-hpa`**: a Deployment that already declares a CPU request.
That request is the number the HPA divides by. Without it, the autoscaler is blind.

### 🎯 Mission

| Field | Value |
|---|---|
| Kind | HorizontalPodAutoscaler |
| Name | `web-hpa` |
| Target Deployment | `web-hpa` |
| CPU target utilization | `50%` |
| Min replicas | `1` |
| Max replicas | `5` |

The HPA must be reading a real CPU metric (TARGETS shows `%/50%`, not `<unknown>`).

### 🔍 How to find it yourself

First, confirm the Deployment is ready and metrics are flowing:

```bash
kubectl get deploy web-hpa
kubectl top pods -l app=web-hpa
```

Now you need to create the HPA. Which `kubectl` verb attaches an autoscaler to a Deployment? Ask the tool:

```bash
kubectl autoscale --help
```

Read the SYNOPSIS and the examples. You will see the flags you need: the target deployment name, the CPU threshold, and the replica bounds. Build your own line from those.

Once the HPA exists, watch it until TARGETS shows a real percentage:

```bash
kubectl get hpa web-hpa -w
kubectl describe hpa web-hpa
```

> [!NOTE]
> `<unknown>` for the first 15-30 seconds is normal: metrics-server scrapes on a short
> interval. Wait and watch. If it never resolves, check `kubectl describe hpa web-hpa`
> for error events.

> [!TIP]
> Want to see the HPA react? Run a CPU busy loop inside the pod and watch replicas climb:
> `kubectl exec deploy/web-hpa -- sh -c "while true; do :; done"`
> Then watch `kubectl get hpa -w`. Scale-down is slow on purpose, to prevent flapping.

📖 Docs: [Horizontal Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/) · [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When TARGETS shows a real **`%/50%`** (not `<unknown>`), hit **Verify**. ✅
