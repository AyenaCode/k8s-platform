## Pourquoi les Deployments ?

Un Pod seul est fragile : supprimez-le, il disparaît. Les vraies charges utilisent un **Deployment** — vous déclarez un état désiré, Kubernetes fait coïncider la réalité avec cet état, en permanence.

Un Deployment vous donne quatre super-pouvoirs :

- **État désiré** — *« je veux 3 replicas de nginx »* ; Kubernetes l'applique en continu.
- **Auto-réparation** — un Pod crashe, un nœud meurt ? Un remplaçant apparaît automatiquement.
- **Scaling** — changez un seul nombre pour avoir plus ou moins de copies.
- **Rolling update & rollback** — déployez une nouvelle image sans coupure ; annulez en une commande.

### La chaîne de propriété

```text
Deployment
  └─gère─▶ ReplicaSet
             └─gère─▶ Pod(s)
(vous éditez) (auto-créé)  (conteneurs)
```

Vous interagissez uniquement avec le **Deployment**. Il crée un **ReplicaSet** dont l'unique rôle est « maintenir exactement N Pods vivants ». Quand vous changez l'image, le Deployment crée un *nouveau* ReplicaSet et bascule les Pods progressivement — c'est le rolling update.

> [!NOTE]
> `apps/v1` est le groupe d'API stable pour les Deployments (et les ReplicaSets).
> Vous verrez `deployment.apps/web` dans la sortie de `kubectl get` — c'est normal.

Dans cette leçon, vous allez créer un Deployment, le scaler, le voir s'auto-réparer, puis déployer une nouvelle version et tester le rollback — le tout dans le terminal en direct.

**Continuer →**
