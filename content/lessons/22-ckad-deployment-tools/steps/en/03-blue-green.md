## Switch traffic blue to green

Blue/green deployment is a selector exercise: run both versions, then make the
Service point at the version that should receive traffic.

### Your task

In namespace **`ckad-deploy`**:

- Deployment `shop-blue`: `1` replica, image `nginx:1.27`, labels `app=shop,track=blue`
- Deployment `shop-green`: `2` replicas, image `nginx:1.27`, labels `app=shop,track=green`
- Service `shop`: port `80`, selector **`app=shop,track=green`**

> [!IMPORTANT]
> A Deployment's `spec.selector` is **immutable**, and it must match the Pod
> template labels. So you cannot `kubectl create deployment` then patch the
> template labels to a different set — apply the manifest with the right
> `selector` and template labels from the start.

```bash
kubectl apply -f - <<'YAML'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shop-blue
  namespace: ckad-deploy
spec:
  replicas: 1
  selector:
    matchLabels: { app: shop, track: blue }
  template:
    metadata:
      labels: { app: shop, track: blue }
    spec:
      containers:
      - { name: web, image: nginx:1.27 }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shop-green
  namespace: ckad-deploy
spec:
  replicas: 2
  selector:
    matchLabels: { app: shop, track: green }
  template:
    metadata:
      labels: { app: shop, track: green }
    spec:
      containers:
      - { name: web, image: nginx:1.27 }
---
apiVersion: v1
kind: Service
metadata:
  name: shop
  namespace: ckad-deploy
spec:
  selector: { app: shop, track: green }
  ports:
  - { port: 80, targetPort: 80 }
YAML
kubectl get endpoints shop -n ckad-deploy
```

The Service must end on green, not blue. To switch back to blue, you would only
change the Service's `selector` to `track: blue`.
