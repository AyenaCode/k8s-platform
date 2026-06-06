## Gate traffic with a readiness probe

Deploy a Pod whose readiness probe only passes when `/tmp/healthy` exists. It
starts *without* that file — so it boots but stays **not ready** and receives no
traffic.

### Your task

**1. Apply the Pod.**

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: ready-demo
  labels:
    app: ready-demo
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    readinessProbe:
      exec:
        command: ["cat", "/tmp/healthy"]
      initialDelaySeconds: 2
      periodSeconds: 3
      failureThreshold: 1
EOF
```

**2. Watch the READY column** — it holds at `0/1` even though STATUS is `Running`:

```bash
kubectl get pod ready-demo -w        # READY 0/1 — Ctrl-C when you've seen it
```

What you should see:

```text
NAME         READY   STATUS    RESTARTS   AGE
ready-demo   0/1     Running   0          5s
```

The container is up, but Kubernetes will not route any traffic to it.

> [!NOTE]
> A failing readiness probe **never restarts** the container. It only removes the
> Pod from its Service endpoints. Traffic stops; the process keeps running.

**3. Make the probe pass** by creating the file inside the container:

```bash
kubectl exec ready-demo -- touch /tmp/healthy
```

**4. Confirm** the Pod flipped to `1/1` READY — with RESTARTS still at `0`:

```bash
kubectl get pod ready-demo
```

What good looks like:

```text
NAME         READY   STATUS    RESTARTS   AGE
ready-demo   1/1     Running   0          30s
```

`RESTARTS 0` is the proof: readiness gated traffic without touching the container.

Then hit **Verify**. ✅
