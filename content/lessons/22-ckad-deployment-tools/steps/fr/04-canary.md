## Executer un canary par ratio de replicas

Les Services Kubernetes ne font pas de routage pondere seuls. Un canary simple
peut etre represente par deux Deployments derriere un meme selector : beaucoup
de replicas stables, peu de replicas canary.

### Ta tache

Dans le namespace **`ckad-deploy`** :

- Deployment `web-stable` : `4` replicas, image `nginx:1.27`, labels `app=web,track=stable`
- Deployment `web-canary` : `1` replica, image `nginx:1.27`, labels `app=web,track=canary`
- Service `web` : port `80`, selector **seulement** `app=web`

Le Service doit voir des endpoints issus des deux Deployments. Comme pour le
blue/green, fixe le `selector` et les labels de template dès le depart (le
selector est immuable) :

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
