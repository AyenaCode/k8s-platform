## Comprendre PV, PVC & StorageClass

Le système de fichiers local d'un Pod est **éphémère**, supprime le Pod et les
données disparaissent. Pour tout ce qui doit survivre (une base de données, des
fichiers téléversés, un cache coûteux à construire), tu as besoin d'un
**stockage persistant**. Trois objets le rendent possible :

- **PersistentVolume (PV)** : un vrai espace de stockage dans le cluster (un
  disque, un partage NFS, un volume cloud).
- **PersistentVolumeClaim (PVC)** : une *demande* de stockage (« donne-moi
  1 Gi en lecture-écriture »). Ton Pod monte la **demande**, pas le volume
  directement.
- **StorageClass** : un gabarit qui **provisionne des PVs automatiquement** à
  la demande d'un PVC. La classe par défaut de ce cluster est `local-path`.

On ne crée presque jamais de PVs à la main. Rédige un PVC, la StorageClass
crée un PV correspondant, et les deux se **lient**. C'est le *provisionnement
dynamique*.

```text
PVC (1Gi, RWO)
  │ demande
  ▼
StorageClass (local-path)
  │ crée
  ▼
PV  ──lie──▶  PVC
               ▲
         Pod monte sur /data
```

> [!WARNING]
> **`local-path` utilise le mode de liaison `WaitForFirstConsumer`.** Un PVC
> fraîchement créé affiche `Pending`, c'est voulu. Le disque n'est provisionné
> qu'une fois qu'un Pod utilisant la demande est planifié sur un nœud. Un PVC
> en attente n'est **pas** un bug ; il attend un consommateur. Tu verras cela
> à l'étape suivante.

> [!NOTE]
> Le PVC est un **handle stable** vers le stockage. Les Pods arrivent et
> repartent ; le PVC (et ses données) reste jusqu'à ce que *tu* le supprimes.

Inspecte la StorageClass par défaut du cluster :

```bash
kubectl get storageclass
```

Ensuite, réserve du stockage et prouve qu'il survit au redémarrage d'un Pod. **Continuer →**
