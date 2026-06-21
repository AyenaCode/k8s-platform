## Réserver du stockage qui survit au Pod

Un PVC, c'est ta demande de casier. Une fois qu'un Pod le monte, le casier est
provisionné et lié. Supprime le Pod et le casier reste ; seule la suppression
du PVC détruit les données.

Ta mission : prouver que des données écrites dans un volume monté survivent à
la suppression et à la recréation du Pod.

### 🎯 Mission

| Objet | Nom | Champs clés |
|-------|-----|-------------|
| PersistentVolumeClaim | `data-pvc` | 1 Gi, `ReadWriteOnce` |
| Pod | `writer` | image `busybox:1.36`, monte `data-pvc` sur `/data` |
| Preuve | fichier `/data/hello.txt` | doit contenir `persisted` après recréation du Pod |

Étapes pour y parvenir :
1. Applique le PVC.
2. Applique un Pod nommé `writer` qui le monte sur `/data`.
3. Écris la chaîne `persisted` dans `/data/hello.txt` via `kubectl exec`.
4. Supprime le Pod, recrée-le avec le même PVC, relis le fichier.

### 🔍 Comment la trouver toi-même

Commence par explorer les champs dont tu as besoin :

```bash
kubectl explain persistentvolumeclaim.spec
kubectl explain persistentvolumeclaim.spec.accessModes
kubectl explain pod.spec.volumes --recursive
kubectl explain pod.spec.containers.volumeMounts
```

Pour écrire dans le Pod en cours d'exécution et relire ensuite :

```bash
kubectl exec <pod> -- sh -c "echo persisted > /data/hello.txt"
kubectl exec <pod> -- cat /data/hello.txt
```

Pour observer le PVC passer de Pending à Bound une fois le Pod planifié :

```bash
kubectl get pvc data-pvc
kubectl describe pvc data-pvc
```

> [!TIP]
> **Le PVC reste Pending ?** C'est normal jusqu'à ce qu'un Pod qui le référence
> soit planifié. `local-path` utilise le mode `WaitForFirstConsumer`. Applique
> ton Pod `writer` et le PVC se liera automatiquement.

📖 Docs : [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) · [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/)

Quand `data-pvc` est **Bound** et que `/data/hello.txt` affiche `persisted`, clique sur **Vérifier**. ✅
