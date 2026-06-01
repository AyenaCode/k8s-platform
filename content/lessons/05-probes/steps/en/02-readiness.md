## Readiness gates traffic

Deploy a Pod whose **readiness** probe only passes when the file `/tmp/healthy`
exists. It starts **without** that file, so it boots but stays **not ready**:

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

Watch its READY column — it stays **`0/1`** even though STATUS is `Running`:

```bash
kubectl get pod ready-demo -w        # READY 0/1, then Ctrl-C
```

The container is up, but Kubernetes will not send it traffic. Now make the probe
pass by creating the file inside the container:

```bash
kubectl exec ready-demo -- touch /tmp/healthy
```

Within a few seconds the Pod flips to **`1/1` READY**. Notice **RESTARTS stays
`0`** — readiness never restarts a container, it only controls traffic.

```bash
kubectl get pod ready-demo
```

When `ready-demo` shows **`1/1` READY** with **0 restarts**, click **Verify**. ✅
