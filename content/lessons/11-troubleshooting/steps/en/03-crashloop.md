## Case 2: CrashLoopBackOff

A Deployment called `crasher` is in trouble. The image pulled fine. But the container keeps starting, dying, and restarting. The RESTARTS counter climbs. Something inside the container is wrong. You are the detective: find the clue, fix the problem.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Deployment | `crasher` |
| Image | `busybox:1.36` |
| Target state | `Running` (READY `1/1`, RESTARTS stops climbing) |

Get `crasher` to one healthy, stable running replica.

### 🔍 How to investigate

Watch the RESTARTS column:

```bash
kubectl get pods
```

Then look at what the container said before it died:

```bash
kubectl logs -l app=crasher
```

If the current container has not produced output yet, read the previous run:

```bash
kubectl logs -l app=crasher --previous
```

Then check the exit code to understand how it ended:

```bash
kubectl describe pod -l app=crasher
```

In the `describe` output, find the **Last State** block inside the container section. Look at `Reason` and `Exit Code`. That exit code is a clue about what kind of failure happened.

```bash
kubectl get events --sort-by=.lastTimestamp
```

> [!TIP]
> `CrashLoopBackOff` means the image itself is fine. The problem is what the container does once it starts. The logs are your best clue: they show the last words of the container before it stopped.

📖 Docs: [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `crasher` is **Running** with a stable RESTARTS counter, hit **Verify**. ✅
