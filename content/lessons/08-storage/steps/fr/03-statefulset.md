## Déployer un StatefulSet avec noms et disques stables

Les Pods d'un Deployment sont **interchangeables** : noms aléatoires, rien de
partagé, créés dans n'importe quel ordre. Les bases de données et les systèmes
distribués ont besoin que chaque membre dispose d'une **identité stable** et de
**son propre disque** qui le suit à travers les redémarrages. C'est le rôle du
**StatefulSet**.

Un StatefulSet t'offre :

- **Des noms stables et ordonnés** : `web-0`, `web-1`, … (jamais de suffixes
  aléatoires).
- **Un stockage par Pod** : chaque réplique obtient son propre PVC depuis un
  `volumeClaimTemplate`. `data-web-0` suit `web-0` ; `data-web-1` suit `web-1`.
  Supprime `web-0`, il revient rattaché à `data-web-0`.
- **Un déploiement ordonné** : `web-0` devient Ready avant que `web-1` ne
  démarre.

> [!IMPORTANT]
> Un StatefulSet requiert un **headless Service** (`clusterIP: None`) référencé
> dans `serviceName`. Ce Service donne à chaque Pod un nom DNS stable
> (`web-0.db`, `web-1.db`). Sans lui, le StatefulSet ne fonctionnera pas
> correctement.

### Ta tâche

**1. Applique le headless Service et le StatefulSet ensemble :**

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None
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
  serviceName: db
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
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
EOF
```

**2. Observe le déploiement ordonné**, `web-0` devient Ready avant que
`web-1` ne démarre :

```bash
kubectl get pods -l app=db -w
```

```text
NAME    READY   STATUS    RESTARTS   AGE
web-0   0/1     Pending   0          2s
web-0   1/1     Running   0          10s
web-1   0/1     Pending   0          11s
web-1   1/1     Running   0          20s
```

Fais Ctrl-C, puis attends le déploiement complet :

```bash
kubectl rollout status statefulset/web --timeout=120s
```

**3. Confirme qu'il y a un PVC Bound par Pod :**

```bash
kubectl get pvc
```

```text
NAME         STATUS   VOLUME          CAPACITY   ACCESS MODES
data-web-0   Bound    pvc-abc123…     1Gi        RWO
data-web-1   Bound    pvc-def456…     1Gi        RWO
```

> [!TIP]
> Chaque Pod dispose aussi d'un nom DNS stable via le headless Service :
> `web-0.db` et `web-1.db`. Les clients internes au cluster peuvent adresser
> chaque réplique directement, sans load balancer.

Lorsque le **StatefulSet `web` affiche 2/2 ready** et que les PVCs
**`data-web-0`** et **`data-web-1`** sont **Bound**, clique sur
**Vérifier**. ✅
