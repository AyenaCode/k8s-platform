## Implement probes

Readiness controls traffic. Liveness controls restarts. For a simple nginx app,
both can use an HTTP GET on `/` port `80`.

### Your task

In namespace **`ckad-observe`**, create Deployment **`probe-api`**:

- image: `nginx:1.27`
- replicas: `1`
- container port: `80`
- readiness probe: HTTP GET `/` on port `80`, initial delay `3`, period `5`
- liveness probe: HTTP GET `/` on port `80`, initial delay `10`, period `10`

Apply YAML, then wait:

```bash
kubectl create namespace ckad-observe
kubectl apply -f probe-api.yaml
kubectl rollout status deployment/probe-api -n ckad-observe
kubectl describe deploy probe-api -n ckad-observe | grep -i probe -A5
```

Hit **Verify** when the Deployment is available.
