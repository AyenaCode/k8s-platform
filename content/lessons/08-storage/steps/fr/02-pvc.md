## Réserver du stockage qui survit au Pod

Vous allez créer un PVC, y attacher un Pod, écrire un fichier, supprimer le
Pod, puis prouver que le fichier est toujours là au retour du Pod.

### Votre tâche

**1. Créez le PVC** `data-pvc` demandant 1 Gi :

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Gi
EOF
```

**2. Vérifiez l'état du PVC** — il doit être `Pending` :

```bash
kubectl get pvc data-pvc
```

```text
NAME       STATUS    VOLUME   CAPACITY   ACCESS MODES
data-pvc   Pending
```

> [!NOTE]
> `Pending` est attendu ici. `local-path` est en mode `WaitForFirstConsumer` —
> le disque n'est pas provisionné tant qu'un Pod n'utilise pas réellement la
> demande.

**3. Créez le Pod `writer`** qui monte `data-pvc` sur `/data`. Au moment où il
est planifié, le volume est provisionné et le PVC passe à `Bound` :

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: writer
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    volumeMounts:
    - name: data
      mountPath: /data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: data-pvc
EOF

kubectl wait --for=condition=Ready pod/writer --timeout=60s
kubectl get pvc data-pvc
```

```text
NAME       STATUS   VOLUME         CAPACITY   ACCESS MODES
data-pvc   Bound    pvc-abc123…    1Gi        RWO
```

**4. Écrivez un fichier dans le volume :**

```bash
kubectl exec writer -- sh -c "echo persisted > /data/hello.txt"
```

**5. Prouvez que cela survit.** Supprimez le Pod, recréez-le, puis relisez le
fichier — les données résident dans le PVC, pas dans le Pod :

```bash
kubectl delete pod writer

kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata: { name: writer }
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    volumeMounts: [{ name: data, mountPath: /data }]
  volumes:
  - name: data
    persistentVolumeClaim: { claimName: data-pvc }
EOF

kubectl wait --for=condition=Ready pod/writer --timeout=60s
kubectl exec writer -- cat /data/hello.txt
```

```text
persisted
```

> [!TIP]
> Le fichier a survécu parce que `data-pvc` n'a pas été supprimé. Supprimez le
> *PVC* et les données disparaissent — le Pod n'a aucun rôle dans la durabilité.

Lorsque `data-pvc` est **Bound** et que `/data/hello.txt` affiche **`persisted`**,
cliquez sur **Vérifier**. ✅
