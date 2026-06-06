## Trigger a liveness restart on a stuck container

A liveness probe is the cluster's self-repair mechanism. When it fails, the kubelet
**kills and restarts** the container — no human required.

### Your task

**1. Apply the Pod.** It creates `/tmp/alive`, waits 15 s, deletes the file, then
sleeps. The liveness probe runs `cat /tmp/alive` — once the file is gone, the probe
fails and the kubelet restarts the container:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: live-demo
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "touch /tmp/alive; sleep 15; rm -f /tmp/alive; sleep 600"]
    livenessProbe:
      exec:
        command: ["cat", "/tmp/alive"]
      initialDelaySeconds: 5
      periodSeconds: 5
      failureThreshold: 1
EOF
```

**2. Watch the Pod.** For the first ~15 s, everything is fine. Then the probe fails
and RESTARTS climbs:

```bash
kubectl get pod live-demo -w        # wait until RESTARTS >= 1, then Ctrl-C
```

What you should see after the restart fires:

```text
NAME        READY   STATUS    RESTARTS   AGE
live-demo   1/1     Running   0          10s
live-demo   0/1     Running   1          22s
live-demo   1/1     Running   1          24s
```

**3. Confirm why** it restarted — check the Pod events:

```bash
kubectl describe pod live-demo | grep -A2 -i liveness
```

Expected output:

```text
Liveness probe failed: cat: can't open '/tmp/alive': No such file or directory
Container app failed liveness probe, will be restarted
```

> [!IMPORTANT]
> Each restart re-runs the container command, so the cycle repeats — exactly what
> happens to a real app that deadlocks. A correctly tuned liveness probe means a
> hung Pod heals itself without a pager alert.

> [!WARNING]
> `failureThreshold: 1` restarts on the very first failure. In production, use
> `failureThreshold: 3` (the default) so transient blips don't cause needless
> restarts.

Then hit **Verify**. ✅
