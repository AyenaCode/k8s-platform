## Case 2: CrashLoopBackOff

Click **Prepare task**. A Deployment named **`crasher`** appears — and immediately
misbehaves. Diagnose:

```bash
kubectl get pods
# crasher-xxxx   0/1   CrashLoopBackOff   3   45s    <- RESTARTS climbing
```

`CrashLoopBackOff` = the container **starts, exits, and is restarted**, over and
over. The kubelet waits longer between each try (the "back-off"). The image pulled
fine — the problem is *inside*. Two places tell you why:

```bash
# The app's own output (the most direct clue):
kubectl logs -l app=crasher
# starting        <- it ran, printed this, then exited

# The events / last state:
kubectl describe pod -l app=crasher | grep -A2 "Last State"
# Last State: Terminated   Reason: Error   Exit Code: 1
```

Exit code 1 right after "starting" — the command does its thing and **returns**.
A container with nothing left to run is considered crashed. (Real causes: a missing
env var, a config file not found, a server that fails to bind a port.)

**Fix it** — re-apply with a command that **keeps running**:

```bash
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crasher
spec:
  replicas: 1
  selector:
    matchLabels:
      app: crasher
  template:
    metadata:
      labels:
        app: crasher
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["sh", "-c", "echo starting; sleep 3600"]   # <- stays alive
EOF

kubectl get pods -l app=crasher -w      # -> 1/1 Running (RESTARTS stops climbing)
```

When `crasher` has a stable **Running** Pod, click **Verify**. ✅
