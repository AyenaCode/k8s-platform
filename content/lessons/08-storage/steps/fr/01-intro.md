## PV, PVC & StorageClass

Le système de fichiers local d'un Pod est **éphémère** — supprimez le Pod et les données disparaissent. Pour tout ce qui doit survivre (une base de données, des fichiers téléversés, un cache coûteux à construire), vous avez besoin d'un **stockage persistant**. Trois objets le rendent possible :

- **PersistentVolume (PV)** — un vrai espace de stockage dans le cluster (un disque, un partage NFS, un volume cloud).
- **PersistentVolumeClaim (PVC)** — une *demande* de stockage (« j'ai besoin de 1Gi en lecture-écriture »). Votre Pod monte la **demande**, pas le volume directement.
- **StorageClass** — un modèle qui **provisionne des PVs automatiquement** lorsqu'un PVC en fait la demande. La classe par défaut de ce cluster est `local-path`.

Vous ne créez presque jamais de PVs manuellement. Vous rédigez un PVC, la StorageClass crée un PV correspondant à la demande, et les deux se **lient**. C'est le *provisionnement dynamique*.

```
PVC (1Gi, RWO)  ──asks──▶  StorageClass (local-path)  ──creates──▶  PV  ──binds──▶  PVC
       ▲
   Pod mounts the PVC at /data
```

Une particularité de `local-path` à connaître d'emblée : son mode de liaison est **`WaitForFirstConsumer`**. Le PVC reste **`Pending`** volontairement jusqu'à ce qu'un Pod l'utilise réellement — ce n'est qu'alors que le disque est créé (sur le nœud où le Pod est planifié). Donc un PVC « Pending » n'est **pas** un problème ici ; il attend un consommateur.

> **Idée clé :** le PVC est un handle stable vers le stockage. Les Pods arrivent et repartent ; le PVC (et ses données) reste jusqu'à ce que *vous* le supprimiez.

Suivant : demandez du stockage, prouvez qu'il survit au redémarrage d'un Pod, puis découvrez les StatefulSets. →
