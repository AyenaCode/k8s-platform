## Gate traffic with a readiness probe

A readiness probe tells Kubernetes: "this Pod is not ready to take traffic yet."
Until it passes, the Pod stays Running but gets zero requests. No restart, just
silence. Think of it as a "do not disturb" sign that the app controls itself.

### 🎯 Mission

Create a Pod that uses an `exec` readiness probe. The probe must check for a file
that does not exist at startup, so the Pod boots but stays `0/1 READY`. Then make
the probe pass without restarting the container.

| Field | Value |
|---|---|
| Pod name | `ready-demo` |
| Image | `busybox:1.36` |
| Container command | keep the container alive for at least an hour |
| Probe type | `exec` |
| Probe command | check whether a specific file exists (your choice of path) |
| Start state | `0/1 READY` (file absent at boot) |
| End state | `1/1 READY`, `RESTARTS` still `0` |

### 🔍 How to find it yourself

Start by reading the exact fields the probe accepts:

```bash
kubectl explain pod.spec.containers.readinessProbe --recursive
```

Look for: `exec`, `command`, `initialDelaySeconds`, `periodSeconds`, `failureThreshold`.
The official docs page has short, copyable field examples; adapt them to your spec.

To observe the Pod while it is not ready:

```bash
kubectl get pod ready-demo -w
kubectl describe pod ready-demo
```

To make the probe pass without restarting the container, run a command inside it:

```bash
kubectl exec ready-demo -- <your command here>
```

> [!TIP]
> **`READY 0/1` does not mean broken.** It means the probe has not passed yet.
> The container is alive. Only traffic is blocked.

📖 Docs: [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `ready-demo` shows `1/1 READY` with `RESTARTS 0`, hit **Verify**. ✅
