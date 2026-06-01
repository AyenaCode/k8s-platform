## Case 3: Service has no endpoints

This one is sneaky — **nothing crashes**. The Pod is healthy, the Service exists,
yet traffic goes nowhere. Click **Prepare task**, then diagnose:

```bash
kubectl get pods -l app=api      # 1/1 Running — the Pod is fine
kubectl get svc api              # the Service exists, has a ClusterIP
kubectl get endpoints api
# NAME   ENDPOINTS   AGE
# api    <none>      30s          <- the smoking gun: no endpoints
```

A Service finds its Pods by **label selector**. `<none>` endpoints means the
selector matches **no Ready Pod**. Compare the two sides:

```bash
kubectl get svc api -o jsonpath='{.spec.selector}{"\n"}'
# {"app":"api-v2"}     <- the Service is looking for app=api-v2

kubectl get pods -l app=api --show-labels
# ... app=api          <- but the Pods are labelled app=api
```

`api-v2` ≠ `api`. The selector points at a label nothing has, so the Service is an
empty shell. This is the **#1 cause** of "my Service returns nothing" — a selector
that does not match the Pod labels.

**Fix it** — re-apply the Service with the correct selector:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api          # <- now matches the Pods
  ports:
  - port: 80
    targetPort: 80
EOF
```

Confirm the endpoints appear:

```bash
kubectl get endpoints api
# api    10.42.x.y:80    ...      <- a Pod IP — traffic will flow now
```

When `kubectl get endpoints api` lists a **Pod IP**, click **Verify**. ✅
