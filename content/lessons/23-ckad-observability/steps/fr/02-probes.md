## Implementer des probes

La readiness controle le trafic. La liveness controle les redemarrages. Pour une
application nginx simple, les deux peuvent utiliser un HTTP GET sur `/` port `80`.

### Ta tache

Dans le namespace **`ckad-observe`**, cree le Deployment **`probe-api`** :

- image : `nginx:1.27`
- replicas : `1`
- port conteneur : `80`
- readiness probe : HTTP GET `/` sur port `80`, initial delay `3`, period `5`
- liveness probe : HTTP GET `/` sur port `80`, initial delay `10`, period `10`

Applique du YAML, puis attends :

```bash
kubectl create namespace ckad-observe
kubectl apply -f probe-api.yaml
kubectl rollout status deployment/probe-api -n ckad-observe
kubectl describe deploy probe-api -n ckad-observe | grep -i probe -A5
```

Clique sur **Verifier** quand le Deployment est disponible.
