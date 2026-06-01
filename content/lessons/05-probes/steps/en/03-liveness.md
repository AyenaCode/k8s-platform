## Liveness restarts a stuck container

A **liveness** probe is the cluster's self-repair. When it fails, the kubelet
**kills and restarts** the container — no human needed.

Deploy a Pod that is healthy for ~15 seconds, then "goes stuck". The container
creates `/tmp/alive`, waits 15s, deletes it, then sleeps. The liveness probe runs
`cat /tmp/alive`, so once the file is gone the probe fails:

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

Watch it. For the first ~15s all is well, then the probe fails and the kubelet
restarts the container — and **RESTARTS climbs**:

```bash
kubectl get pod live-demo -w        # wait until RESTARTS >= 1, then Ctrl-C
```

Confirm *why* it restarted in the events:

```bash
kubectl describe pod live-demo | grep -A2 -i liveness
# Liveness probe failed: cat: can't open '/tmp/alive': No such file or directory
# Container app failed liveness probe, will be restarted
```

Each restart re-runs the command, so the cycle repeats — exactly what would happen
to a real app that deadlocks. In production a *correct* liveness probe means a
hung Pod heals itself.

When `live-demo` shows **RESTARTS ≥ 1**, click **Verify**. ✅
