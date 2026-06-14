## Fix a Service with no endpoints

Click **Prepare**. A Deployment and a Service are created, but the Service has no
endpoints because its selector does not match the Pods.

### Your task

Diagnose:

```bash
kubectl get pods -n ckad-net --show-labels
kubectl get svc svc-api -n ckad-net -o yaml
kubectl get endpoints svc-api -n ckad-net
```

Patch Service **`svc-api`** so it selects the Deployment Pods:

```bash
kubectl patch svc svc-api -n ckad-net -p '{"spec":{"selector":{"app":"svc-api"}}}'
kubectl get endpoints svc-api -n ckad-net
```

Verify when endpoints appear.
