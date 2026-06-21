## Comprendre PV, PVC & StorageClass

Le disque local d'un conteneur est comme un chateau de sable : quand le Pod
meurt, le chateau disparait. Pour tout ce qui doit survivre (une base de
données, des fichiers téléversés, un cache coûteux à construire), tu as besoin
d'une **boite** qui existe en dehors du Pod. Kubernetes te propose trois
objets pour cela :

- **PersistentVolume (PV)** : le vrai espace de stockage dans le cluster (un
  disque, un partage NFS, un volume cloud). C'est le casier physique.
- **PersistentVolumeClaim (PVC)** : ta *demande* d'un casier d'une taille et
  d'un mode d'accès précis. Ton Pod monte la demande, pas le volume
  directement.
- **StorageClass** : un gabarit qui provisionne des PVs automatiquement.
  La classe par défaut de ce cluster est `local-path`.

On ne crée presque jamais de PVs à la main. Rédige un PVC, la StorageClass
crée un PV correspondant, et les deux se **lient**. C'est le
*provisionnement dynamique*.

```text
PVC (1Gi, RWO)
  │ demande
  ▼
StorageClass (local-path)
  │ crée
  ▼
PV  --lie-->  PVC
               ^
         Pod monte sur /data
```

> [!WARNING]
> **`local-path` utilise le mode `WaitForFirstConsumer`.** Un PVC fraichement
> créé affiche `Pending`, c'est voulu. Le disque n'est provisionné qu'une fois
> qu'un Pod utilisant la demande est planifié sur un noeud. Un PVC en attente
> n'est **pas** un bug ; il attend un consommateur.

> [!NOTE]
> Le PVC est un **handle stable** vers le stockage. Les Pods arrivent et
> repartent ; le PVC (et ses données) reste jusqu'à ce que *tu* le supprimes.

Inspecte la StorageClass par défaut du cluster avant de continuer :

```bash
kubectl get storageclass
kubectl explain persistentvolumeclaim.spec
```

📖 Docs : [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) · [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

Ensuite, réserve du stockage et prouve qu'il survit au redémarrage d'un Pod.
