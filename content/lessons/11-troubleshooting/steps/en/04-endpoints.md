## Diagnose and fix a Service with no endpoints

This one is subtle — nothing crashes. The Pod is healthy, the Service exists, yet traffic goes nowhere. This is the most common "it works locally" production mystery.

### Diagnose

**1. Spot the symptom** — the Pod looks fine:

```bash
kubectl get pods -l app=api
```

```text
NAME                   READY   STATUS    RESTARTS   AGE
api-7c9f6b8c5-m3xpw   1/1     Running   0          45s
```

**2. Check the Service** — it has a ClusterIP but something is wrong:

```bash
kubectl get svc api
kubectl get endpoints api
```

```text
NAME   TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
api    ClusterIP   10.96.45.102   <none>        80/TCP    45s

NAME   ENDPOINTS   AGE
api    <none>      45s
```

`<none>` — that is the smoking gun. A Service with no endpoints forwards traffic to nothing.

**3. Compare the selector to the Pod labels** — a Service finds Pods by label selector:

```bash
kubectl get svc api -o jsonpath='{.spec.selector}{"\n"}'
```

```text
{"app":"api-v2"}
```

```bash
kubectl get pods -l app=api --show-labels
```

```text
NAME                   LABELS
api-7c9f6b8c5-m3xpw   app=api, pod-template-hash=7c9f6b8c5
```

`app=api-v2` (Service) ≠ `app=api` (Pod). The selector points at a label no Pod has, so the Service is an empty shell.

> [!WARNING]
> This mismatch is the **#1 cause** of "my Service returns nothing" in production. A selector typo, a forgotten version suffix, or a copy-paste from a different Deployment — all produce the same silent failure: the Pod is healthy but unreachable.

**4. Confirm with events** — the Service itself produces no event for this, so compare the raw objects:

```bash
kubectl get svc api -o yaml | grep -A3 selector
kubectl get deploy api -o yaml | grep -A3 matchLabels
```

### Your task

**1. Re-apply the Service** with the correct selector — keep the same Service name:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api          # matches the Pod labels
  ports:
  - port: 80
    targetPort: 80
EOF
```

**2. Confirm the endpoints now show a Pod IP:**

```bash
kubectl get endpoints api
```

```text
NAME   ENDPOINTS         AGE
api    10.42.0.12:80     45s
```

> [!TIP]
> Endpoints appear within a second of the selector matching a Ready Pod. If you still see `<none>`, double-check `kubectl get pods -l app=api` — the Pod must be `1/1 Running`.

Then hit **Verify**. ✅
