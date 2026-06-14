## Run a replica-ratio canary

Kubernetes Services do not do weighted routing by themselves. A simple canary can
be represented by two Deployments behind one selector: many stable replicas, few
canary replicas.

### Your task

In namespace **`ckad-deploy`**:

- Deployment `web-stable`: `4` replicas, image `nginx:1.27`, labels `app=web,track=stable`
- Deployment `web-canary`: `1` replica, image `nginx:1.27`, labels `app=web,track=canary`
- Service `web`: port `80`, selector **only** `app=web`

The Service should see endpoints from both Deployments. As with blue/green, set
each Deployment's `selector` and template labels from the start (the selector is
immutable):

```bash
kubectl apply -f - <<'YAML'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-stable
  namespace: ckad-deploy
spec:
  replicas: 4
  selector:
    matchLabels: { app: web, track: stable }
  template:
    metadata:
      labels: { app: web, track: stable }
    spec:
      containers:
      - { name: web, image: nginx:1.27 }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-canary
  namespace: ckad-deploy
spec:
  replicas: 1
  selector:
    matchLabels: { app: web, track: canary }
  template:
    metadata:
      labels: { app: web, track: canary }
    spec:
      containers:
      - { name: web, image: nginx:1.27 }
---
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: ckad-deploy
spec:
  selector: { app: web }
  ports:
  - { port: 80, targetPort: 80 }
YAML
kubectl get endpoints web -n ckad-deploy
```
