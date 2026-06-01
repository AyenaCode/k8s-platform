## Hit a memory limit (OOMKilled)

Now the dramatic one. Deploy a container with a tiny **20Mi** memory limit, then
make it allocate memory without bound. `tail /dev/zero` reads an endless stream of
zero bytes into memory — a classic memory hog:

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

Within seconds the container crosses 20Mi and the kernel's OOM-killer terminates
it. Watch the STATUS flip to `OOMKilled`, then `CrashLoopBackOff` as it keeps
retrying:

```bash
kubectl get pod hog -w        # see OOMKilled / CrashLoopBackOff, then Ctrl-C
```

The STATUS string is transient, so the **reliable** proof is the container's last
terminated state:

```bash
kubectl get pod hog -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}{"\n"}'
# -> OOMKilled

kubectl describe pod hog | grep -A3 "Last State"
# Last State: Terminated   Reason: OOMKilled   Exit Code: 137
```

Exit code **137** = killed by signal 9 (SIGKILL) from the OOM-killer. In real life
this is the #1 reason a "fine" container keeps dying — its memory limit is too low.

When `hog` shows **lastState reason `OOMKilled`**, click **Verify**. ✅
