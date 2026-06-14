## Reparer un Service sans endpoints

Clique sur **Preparer**. Un Deployment et un Service sont crees, mais le Service
n'a aucun endpoint car son selector ne correspond pas aux Pods.

### Ta tache

Diagnostique :

```bash
kubectl get pods -n ckad-net --show-labels
kubectl get svc svc-api -n ckad-net -o yaml
kubectl get endpoints svc-api -n ckad-net
```

Patch le Service **`svc-api`** pour selectionner les Pods du Deployment :

```bash
kubectl patch svc svc-api -n ckad-net -p '{"spec":{"selector":{"app":"svc-api"}}}'
kubectl get endpoints svc-api -n ckad-net
```

Verifie quand les endpoints apparaissent.
