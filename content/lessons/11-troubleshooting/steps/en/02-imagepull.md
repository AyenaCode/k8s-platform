## Case 1: ImagePullBackOff

A Deployment called `broken-img` is stuck. The Pod is not running. The container never even started. Your job: read the clues, find out what is wrong with the image, and make it healthy.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Deployment | `broken-img` |
| Target state | `Running` (READY `1/1`) |

The Pod is failing to start. Kubernetes keeps retrying with longer and longer waits. Find out why, fix it, and get one available replica.

### 🔍 How to investigate

Start with the status column, then go deeper:

```bash
kubectl get pods
```

Look at the STATUS. Then get the full story:

```bash
kubectl describe pod -l app=broken-img
```

Scroll to the **Events** section at the bottom. The warning lines there name exactly what failed and why.

```bash
kubectl logs -l app=broken-img
```

Not much here (the container never started), but it confirms the container state.

```bash
kubectl get events --sort-by=.lastTimestamp
```

This gives you a timeline of everything that happened across the namespace.

> [!TIP]
> In the Events section of `describe`, look at the `Reason` column and the `Message` column together. The message tells you the exact image reference Kubernetes tried to pull.

📖 Docs: [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `broken-img` is **Running** with `1/1` ready, hit **Verify**. ✅
