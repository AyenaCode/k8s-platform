## Diagnose and fix a CrashLoopBackOff

The platform just deployed `crasher`, a Pod that starts and immediately dies. The kubelet keeps restarting it, backing off longer each time.

### Diagnose

**1. Spot the symptom**: watch the RESTARTS column climb:

```bash
kubectl get pods
```

```text
NAME                    READY   STATUS             RESTARTS   AGE
crasher-5b8f7d9c4-r2zt   0/1     CrashLoopBackOff   4          90s
```

`CrashLoopBackOff` means the image pulled fine but the **container starts, exits, and is restarted** over and over. The problem is inside the container.

**2. Read the logs**: this is your most direct clue for a crash:

```bash
kubectl logs -l app=crasher
```

```text
starting
```

It printed one line and exited. That is the entire output. A container with nothing left to run is treated as crashed.

**3. Confirm the exit code**: check the last state:

```bash
kubectl describe pod -l app=crasher
```

Scroll to **Last State** in the container section:

```text
Last State:  Terminated
  Reason:    Error
  Exit Code: 1
```

> [!NOTE]
> Exit code 1 is a generic application error. Real-world causes: a missing environment variable, a config file not found at startup, or a server that fails to bind its port. Always check logs first: the crash message is there.

**4. Read previous logs**: after multiple restarts, the current container may not have produced output yet. Use `--previous` to read the last completed run:

```bash
kubectl logs -l app=crasher --previous
```

> [!TIP]
> `kubectl events --for pod/<name>` is the cleaner way to see just a Pod's events without scrolling through the full `describe` output.

### Your task

**1. Re-apply the Deployment** with a command that stays alive, keeping the same Deployment name and image:

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
        command: ["sh", "-c", "echo starting; sleep 3600"]   # stays alive
EOF
```

**2. Confirm the RESTARTS counter stops climbing:**

```bash
kubectl get pods -l app=crasher -w
```

```text
NAME                     READY   STATUS    RESTARTS   AGE
crasher-6d9c8f7b4-kw4lp   1/1     Running   0          8s
```

Then hit **Verify**. ✅
