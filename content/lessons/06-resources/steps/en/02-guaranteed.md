## Build a Guaranteed Pod

**Guaranteed** is the highest QoS class. The rule is strict: every container must
set **both** cpu and memory, and `limits` must **equal** `requests` for each.

> [!NOTE]
> Pod resource fields are immutable after creation. If you need to change them,
> delete the Pod and re-apply. The cluster enforces this — you cannot `kubectl apply`
> changed resource values onto a live Pod.

### Your task

**1. Apply the Guaranteed Pod:**

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

**2. Confirm the QoS class Kubernetes assigned:**

```bash
kubectl get pod guaranteed-demo -o jsonpath='{.status.qosClass}{"\n"}'
```

What good looks like:

```text
Guaranteed
```

**3. Cross-check with describe:**

```bash
kubectl describe pod guaranteed-demo | grep -i qos
```

What good looks like:

```text
QoS Class:  Guaranteed
```

> [!TIP]
> To see the other QoS classes without touching `guaranteed-demo`, apply a second
> Pod with `limits != requests` (→ **Burstable**) or with no resource fields at all
> (→ **BestEffort**, evicted first). Delete it when done.

Then hit **Verify**. ✅
