## L'auto-réparation en direct

Kubernetes tourne une boucle de réconciliation permanente : il compare « ce qui est » avec « ce que tu as demandé » et agit pour combler l'écart. Supprime un Pod et le ReplicaSet le remarque en quelques millisecondes, puis planifie un remplaçant.

### Manipulations

**1. Note le nom d'un Pod en cours :**

```bash
kubectl get pods -l app=web
```

**2. Supprime un Pod** (cette commande choisit le premier automatiquement) :

```bash
kubectl delete $(kubectl get pod -l app=web -o name | head -1)
```

**3. Reliste immédiatement** (un remplaçant est déjà en cours de planification) :

```bash
kubectl get pods -l app=web
```

Tu devrais voir le compteur passer à 4 l'espace d'un instant, puis un nouveau Pod apparaître en `ContainerCreating`.

> [!IMPORTANT]
> C'est la **boucle de réconciliation** : observer, comparer, agir.
> Le contrôleur ReplicaSet a vu `current=4 < desired=5` et a créé un nouveau Pod en quelques millisecondes. Cette même boucle replanifie les Pods quand un nœud entier tombe.

> [!WARNING]
> Un Pod seul (créé avec `kubectl run`, sans Deployment) n'est **pas** recréé à la suppression. Seuls les objets gérés par un contrôleur bénéficient de cette puissance.

Cette étape est de l'observation uniquement. Pas de vérification. **Continuer →**
