## Pourquoi les Deployments ?

Vous avez vu qu'un Pod seul est fragile — supprimez-le et il disparaît
définitivement. Les vraies charges utilisent un **Deployment**, qui apporte :

- **État désiré** — vous déclarez *« je veux 3 replicas de nginx »* et Kubernetes
  fait en sorte que la réalité corresponde en permanence.
- **Auto-réparation** — un Pod crashe ou son nœud meurt ? Un nouveau est créé.
- **Scaling** — changez un seul nombre pour avoir plus ou moins de copies.
- **Rolling update & rollback** — déployez une nouvelle image sans coupure, et
  revenez en arrière instantanément si ça tourne mal.

La chaîne d'objets :

```
Deployment  ──gère──▶  ReplicaSet  ──gère──▶  Pods
 (vous éditez ça)      (auto-créé)            (les conteneurs qui tournent)
```

Vous interagissez presque toujours avec le **Deployment**. Il crée un
**ReplicaSet**, dont l'unique rôle est de maintenir exactement N Pods vivants.
Quand vous changez l'image, le Deployment crée un *nouveau* ReplicaSet et bascule
les Pods progressivement.

Dans cette leçon vous allez en créer un, le scaler, le voir s'auto-réparer, puis
déployer une nouvelle version — le tout dans le terminal à droite.
