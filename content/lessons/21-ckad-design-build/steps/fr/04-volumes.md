## Volumes persistants et ephemeres

La CKAD attend que tu distingues stockage temporaire et stockage durable.
`emptyDir` disparait avec le Pod. Un PVC survit au remplacement d'un Pod.

### Ta tache

Dans le namespace **`ckad-design`** :

1. Cree le PVC **`ckad-data`** avec une demande de `1Mi`.
2. Cree le Pod **`volume-worker`** avec l'image `busybox:1.36` et la commande `sleep 3600`.
3. Monte le PVC sur **`/data`**.
4. Monte un volume `emptyDir` nomme **`cache`** sur **`/cache`**.

Exemple de PVC :

```bash
kubectl apply -f - <<'YAML'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ckad-data
  namespace: ckad-design
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Mi
YAML
```

Ensuite cree le manifest du Pod et attends qu'il soit Running.
