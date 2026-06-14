## Requests, limits, quota, admission

ResourceQuota and LimitRange are enforced by admission controllers. A manifest
can look valid but still be rejected if it violates namespace policy.

> [!IMPORTANT]
> Once a ResourceQuota constrains `requests.cpu` **and** `limits.memory`, every
> Pod in the namespace must carry a cpu request and a memory limit, otherwise it
> is rejected at admission. So the LimitRange below provides **both** cpu and
> memory defaults. That is what lets the other Pods in this module (`secure-app`,
> `hardened`) be admitted into `ckad-sec` even though their tasks never set cpu.

### Your task

In namespace **`ckad-sec`**, create:

1. ResourceQuota **`compute-quota`**
   - `requests.cpu: "1"`
   - `limits.memory: 1Gi`
2. LimitRange **`container-defaults`**
   - default limit: `cpu: 200m`, `memory: 128Mi`
   - default request: `cpu: 50m`, `memory: 64Mi`
3. Deployment **`limited-api`**
   - image `nginx:1.27`
   - replicas `2`
   - request `cpu: 100m`, `memory: 64Mi`
   - limit `memory: 128Mi`

A complete set of manifests:

```bash
kubectl create namespace ckad-sec
kubectl apply -f - <<'YAML'
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: ckad-sec
spec:
  hard:
    requests.cpu: "1"
    limits.memory: 1Gi
---
apiVersion: v1
kind: LimitRange
metadata:
  name: container-defaults
  namespace: ckad-sec
spec:
  limits:
  - type: Container
    default:
      cpu: 200m
      memory: 128Mi
    defaultRequest:
      cpu: 50m
      memory: 64Mi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: limited-api
  namespace: ckad-sec
spec:
  replicas: 2
  selector:
    matchLabels:
      app: limited-api
  template:
    metadata:
      labels:
        app: limited-api
    spec:
      containers:
      - name: web
        image: nginx:1.27
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            memory: 128Mi
YAML
kubectl rollout status deployment/limited-api -n ckad-sec
```

Use `kubectl describe quota -n ckad-sec` to see what the admission controller is
tracking.
