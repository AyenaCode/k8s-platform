## Mettre a jour un Deployment en rolling update

Les rolling updates sont un mecanisme de Deployment : continuer a servir le
trafic pendant le remplacement controle des Pods.

### Ta tache

Dans le namespace **`ckad-deploy`**, cree le Deployment **`api`** :

- replicas : `3`
- image finale : `httpd:2.4`
- strategy : `RollingUpdate`
- `maxSurge: 1`
- `maxUnavailable: 1`

Une route possible :

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

Verifie quand les 3 replicas sont disponibles.
