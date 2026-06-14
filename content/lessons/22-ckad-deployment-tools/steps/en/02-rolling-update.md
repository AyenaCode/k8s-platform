## Rolling update a Deployment

Rolling updates are Deployment mechanics: keep serving traffic while replacing
Pods in controlled batches.

### Your task

In namespace **`ckad-deploy`**, create Deployment **`api`**:

- replicas: `3`
- final image: `httpd:2.4`
- strategy: `RollingUpdate`
- `maxSurge: 1`
- `maxUnavailable: 1`

One route:

```bash
kubectl create namespace ckad-deploy
kubectl create deployment api -n ckad-deploy --image=nginx:1.27 --replicas=3
kubectl patch deployment api -n ckad-deploy --type=merge -p '{
  "spec": {
    "strategy": {
      "type": "RollingUpdate",
      "rollingUpdate": { "maxSurge": 1, "maxUnavailable": 1 }
    }
  }
}'
kubectl set image deployment/api -n ckad-deploy '*=httpd:2.4'
kubectl rollout status deployment/api -n ckad-deploy
kubectl rollout history deployment/api -n ckad-deploy
```

Verify after all 3 replicas are available.
