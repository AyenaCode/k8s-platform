## StatefulSets : noms stables & disques dédiés

Les Pods d'un Deployment sont **interchangeables** — noms aléatoires, rien de partagé, créés dans n'importe quel ordre. C'est inadapté aux bases de données et aux clusters, où chaque membre a besoin d'une **identité stable** et de **son propre disque** qui le suit à travers les redémarrages.

C'est là qu'intervient le **StatefulSet**. Il vous offre :

- **Des noms stables et ordonnés** : `web-0`, `web-1`, … (pas de suffixes aléatoires).
- **Un stockage stable par Pod** : chaque réplique obtient son propre PVC depuis un `volumeClaimTemplate` — `data-web-0`, `data-web-1`. Supprimez `web-0`, il revient en tant que `web-0` rattaché à `data-web-0`.
- **Un déploiement ordonné** : `web-0` devient Ready avant que `web-1` ne démarre.

Un StatefulSet nécessite un **headless Service** (`clusterIP: None`) pour donner à chaque Pod un nom DNS stable. Appliquez les deux :

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None          # headless: DNS resolves to each Pod, no load-balancing
  selector:
    app: db
  ports:
  - port: 80
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: db          # must match the headless Service above
  replicas: 2
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["sh", "-c", "sleep 3600"]
        volumeMounts:
        - name: data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: data           # produces PVCs: data-web-0, data-web-1
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
EOF
```

Observez la création **ordonnée** — `web-0` en premier, puis `web-1` :

```bash
kubectl get pods -l app=db -w        # web-0 Ready, then web-1 appears; Ctrl-C
kubectl rollout status statefulset/web --timeout=120s
```

Constatez qu'il y a un PVC **par Pod**, chacun Bound :

```bash
kubectl get pvc
# data-web-0   Bound ...
# data-web-1   Bound ...
```

Chaque Pod possède également un nom DNS stable : `web-0.db`, `web-1.db`.

Lorsque le StatefulSet affiche **2/2 ready** et que les PVCs **`data-web-0`** et **`data-web-1`** sont **Bound**, cliquez **Vérifier**. ✅
