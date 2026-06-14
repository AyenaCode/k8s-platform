## Requests, limits, quota, admission

ResourceQuota et LimitRange sont appliques par des admission controllers. Un
manifest peut sembler valide mais etre rejete s'il viole la politique du
namespace.

> [!IMPORTANT]
> Des qu'une ResourceQuota contraint `requests.cpu` **et** `limits.memory`, chaque
> Pod du namespace doit porter une requete cpu et une limite memoire, sinon il
> est rejete a l'admission. Le LimitRange ci-dessous fournit donc des defauts
> **cpu et memoire**. C'est ce qui permet aux autres Pods de ce module
> (`secure-app`, `hardened`) d'etre admis dans `ckad-sec` alors que leurs taches
> ne fixent jamais le cpu.

### Ta tache

Dans le namespace **`ckad-sec`**, cree :

1. ResourceQuota **`compute-quota`**
   - `requests.cpu: "1"`
   - `limits.memory: 1Gi`
2. LimitRange **`container-defaults`**
   - limite par defaut : `cpu: 200m`, `memory: 128Mi`
   - request par defaut : `cpu: 50m`, `memory: 64Mi`
3. Deployment **`limited-api`**
   - image `nginx:1.27`
   - replicas `2`
   - request `cpu: 100m`, `memory: 64Mi`
   - limit `memory: 128Mi`

Un jeu complet de manifests :

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

Utilise `kubectl describe quota -n ckad-sec` pour voir ce que l'admission
controle.
