## Réserver du stockage qui survit au Pod

Créez un PersistentVolumeClaim demandant 1Gi :

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

Vérifiez — il est **`Pending`**, et c'est attendu :

```bash
kubectl get pvc data-pvc
# STATUS: Pending   (WaitForFirstConsumer — waiting for a Pod to use it)
```

Créez maintenant un Pod qui **monte** la demande sur `/data`. Au moment où il est planifié, le volume est provisionné et le PVC passe à l'état **`Bound`** :

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
kubectl get pvc data-pvc        # STATUS: Bound
```

Écrivez un fichier dans le volume :

```bash
kubectl exec writer -- sh -c "echo persisted > /data/hello.txt"
```

**Prouvez que cela survit.** Supprimez le Pod, recréez-le, et le fichier est toujours là — car les données résident dans le PVC, pas dans le Pod :

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
kubectl exec writer -- cat /data/hello.txt      # -> persisted  (it survived!)
```

Lorsque le PVC est **Bound** et que `/data/hello.txt` affiche **`persisted`**, cliquez **Vérifier**. ✅
