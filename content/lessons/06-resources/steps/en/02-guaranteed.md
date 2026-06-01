## Build a Guaranteed Pod

The highest QoS class, **Guaranteed**, has a strict rule: **every** container must
set **both** cpu and memory, and for each resource `limits` must **equal**
`requests`. Build one:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: guaranteed-demo
spec:
  containers:
  - name: app
    image: nginx:1.27
    resources:
      requests: { cpu: "100m", memory: "64Mi" }
      limits:   { cpu: "100m", memory: "64Mi" }
EOF
```

Once it is running, ask Kubernetes which class it assigned:

```bash
kubectl get pod guaranteed-demo -o jsonpath='{.status.qosClass}{"\n"}'
# -> Guaranteed
```

Try it: change one `limits` value so it no longer equals the request (e.g. memory
limit `128Mi`) and re-apply — the class drops to **Burstable**. Set *no*
requests/limits at all and it becomes **BestEffort**, the first to be evicted.

```bash
kubectl describe pod guaranteed-demo | grep -i qos
```

When `guaranteed-demo` reports **QoS Class: Guaranteed**, click **Verify**. ✅
