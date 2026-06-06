## L'auto-réparation en direct

Le modèle d'état désiré signifie que Kubernetes réconcilie en permanence « ce qui est » avec « ce que tu as demandé ». Supprime un Pod et le cluster comble le vide en quelques millisecondes : aucune intervention humaine requise.

### Manipulations

**1. Note le nom d'un Pod en cours :**

```bash
kubectl get pods -l app=web
```

**2. Supprime un Pod** (la commande ci-dessous choisit automatiquement le premier) :

```bash
kubectl delete "$(kubectl get pod -l app=web -o name | head -1)"
```

**3. Reliste immédiatement (un remplaçant est déjà en cours de planification) :**

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
> tombe. Tu déclares *ce que* tu veux : Kubernetes l'applique sans relâche.

> [!WARNING]
> Un **Pod seul** (créé avec `kubectl run`, sans Deployment) n'est **pas** recréé
> à la suppression. Seuls les objets gérés par un contrôleur (Deployment → ReplicaSet)
> s'auto-réparent.

Cette étape est uniquement de l'observation : pas de vérification. **Continuer →**
