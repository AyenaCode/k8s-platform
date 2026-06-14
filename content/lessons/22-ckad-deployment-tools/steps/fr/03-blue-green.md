## Basculer le trafic de blue vers green

Le blue/green est un exercice de selectors : les deux versions tournent, puis le
Service pointe vers la version qui doit recevoir le trafic.

### Ta tache

Dans le namespace **`ckad-deploy`** :

- Deployment `shop-blue` : `1` replica, image `nginx:1.27`, labels `app=shop,track=blue`
- Deployment `shop-green` : `2` replicas, image `nginx:1.27`, labels `app=shop,track=green`
- Service `shop` : port `80`, selector **`app=shop,track=green`**

> [!IMPORTANT]
> Le `spec.selector` d'un Deployment est **immuable** et doit correspondre aux
> labels du template Pod. Tu ne peux donc pas faire `kubectl create deployment`
> puis patcher les labels du template vers un autre jeu — applique le manifest
> avec le bon `selector` et les bons labels de template dès le depart.

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

Le Service doit finir sur green, pas blue. Pour revenir sur blue, il suffirait de
changer le `selector` du Service en `track: blue`.
