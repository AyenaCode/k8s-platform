## Trigger an OOMKilled

Deploy a container with a **20Mi** memory limit, then make it allocate without
bound. `tail /dev/zero` streams endless zero-bytes into memory — the kernel's
OOM-killer terminates it the moment it crosses the limit.

### Your task

**1. Apply the hog Pod:**

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: hog
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "tail /dev/zero"]
    resources:
      requests: { memory: "10Mi" }
      limits:   { memory: "20Mi" }
EOF
```

**2. Watch the STATUS flip** — within seconds it hits 20Mi and the kernel kills it:

```bash
kubectl get pod hog -w        # Ctrl-C once you see OOMKilled
```

What good looks like:

```text
NAME   READY   STATUS       RESTARTS   AGE
hog    0/1     OOMKilled    0          4s
hog    0/1     CrashLoopBackOff   1   8s
```

> [!NOTE]
> `STATUS` is transient — the kubelet restarts the container and the string changes.
> The reliable proof is the **last terminated state**, which persists across restarts.

**3. Confirm the OOMKilled reason:**

```bash
kubectl get pod hog -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}{"\n"}'
```

What good looks like:

```text
OOMKilled
```

**4. Inspect the full terminated state:**

```bash
kubectl describe pod hog | grep -A3 "Last State"
```

What good looks like:

```text
Last State:  Terminated
  Reason:    OOMKilled
  Exit Code: 137
```

> [!IMPORTANT]
> Exit code **137** = killed by signal 9 (SIGKILL) from the kernel's OOM-killer.
> This is the #1 reason a "healthy" container keeps restarting in production — its
> memory limit is set too low. Raise the limit or fix the leak.

> [!WARNING]
> `CrashLoopBackOff` does **not** always mean OOMKilled — it only means the
> container keeps crashing. Always read `lastState.terminated.reason` and the exit
> code to know the real cause.

Then hit **Verify**. ✅
