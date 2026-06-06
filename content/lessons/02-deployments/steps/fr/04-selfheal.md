## L'auto-réparation en direct

Le modèle d'état désiré signifie que Kubernetes réconcilie en permanence « ce qui est » avec « ce que vous avez demandé ». Supprimez un Pod et le cluster comble le vide en quelques millisecondes — aucune intervention humaine requise.

### Manipulations

**1. Notez le nom d'un Pod en cours :**

```bash
kubectl get pods -l app=web
```

**2. Supprimez un Pod** (la commande ci-dessous choisit automatiquement le premier) :

```bash
kubectl delete "$(kubectl get pod -l app=web -o name | head -1)"
```

**3. Relistez immédiatement — un remplaçant est déjà en cours de planification :**

```bash
kubectl get pods -l app=web
```

Ce que « bon » donne :

```text
NAME                READY   STATUS              AGE
web-74d9c-aaaa      1/1     Running             4m
web-74d9c-bbbb      1/1     Running             4m
web-74d9c-cccc      1/1     Running             4m
web-74d9c-dddd      1/1     Running             4m
web-74d9c-ffff      0/1     ContainerCreating   1s  ← nouveau
```

> [!IMPORTANT]
> C'est la **boucle de réconciliation** : observer → comparer → agir.
> Le contrôleur ReplicaSet a vu `current=4 < desired=5` et a créé un nouveau Pod
> en quelques millisecondes. Cette même boucle replanifie les Pods quand un nœud
> tombe. Vous déclarez *ce que* vous voulez — Kubernetes l'applique sans relâche.

> [!WARNING]
> Un **Pod seul** (créé avec `kubectl run`, sans Deployment) n'est **pas** recréé
> à la suppression. Seuls les objets gérés par un contrôleur (Deployment → ReplicaSet)
> s'auto-réparent.

Cette étape est uniquement de l'observation — pas de vérification. **Continuer →**
