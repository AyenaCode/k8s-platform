## Trigger a liveness restart on a stuck container

A liveness probe is the cluster's self-repair mechanism. When it fails, the kubelet
kills and restarts the container without any human action. Think of it as a
watchdog: "if the app stops responding, restart it."

Your job is to build a Pod that deliberately breaks its own liveness check, then
watch Kubernetes fix it automatically.

### 🎯 Mission

Create a Pod where the liveness probe passes at start, then fails on its own
after a short delay, causing at least one container restart.

| Field | Value |
|---|---|
| Pod name | `live-demo` |
| Image | `busybox:1.36` |
| Container command | create a file, wait ~15 s, delete the file, then sleep |
| Probe type | `exec` |
| Probe command | check that the file still exists |
| `initialDelaySeconds` | 5 |
| `periodSeconds` | 5 |
| `failureThreshold` | 1 |
| End state | `RESTARTS >= 1` |

### 🔍 How to find it yourself

Read the liveness probe fields:

```bash
kubectl explain pod.spec.containers.livenessProbe --recursive
```

The structure is the same as `readinessProbe`; only the field name changes.
The docs page shows a working `exec` example; copy the shape, not the content.

Watch the Pod while it runs. You will see `RESTARTS` go from `0` to `1`:

```bash
kubectl get pod live-demo -w
```

After the restart fires, check why it happened:

```bash
kubectl describe pod live-demo
```

> [!IMPORTANT]
> Each restart re-runs the container command from scratch, so the cycle repeats.
> This is exactly what happens to a real app that deadlocks: a correctly tuned
> liveness probe makes it heal itself.

> [!WARNING]
> `failureThreshold: 1` restarts on the very first failure. In production use
> `failureThreshold: 3` (the default) so transient blips do not cause needless
> restarts.

📖 Docs: [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `live-demo` shows `RESTARTS >= 1`, hit **Verify**. ✅
