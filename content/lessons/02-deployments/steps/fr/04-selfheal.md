## Auto-réparation — en direct

C'est la magie du modèle d'état désiré. Listez les Pods, supprimez-en un, et
regardez un remplaçant apparaître instantanément.

```bash
# notez le nom d'un Pod
kubectl get pods -l app=web

# supprimez-le
kubectl delete pod <un-des-noms-de-pod>

# relistez aussitôt — un nouveau Pod est déjà en création
kubectl get pods -l app=web
```

Vous avez demandé 5 replicas ; vous en avez supprimé un ; le ReplicaSet a vu
`current=4 < desired=5` et a créé un nouveau Pod en quelques millisecondes. Vous
n'avez jamais à intervenir.

> **Idée clé :** vous déclarez *ce que* vous voulez, les contrôleurs poussent sans
> relâche la réalité vers cet état. Cette boucle — *observer → comparer → agir* —
> est le cœur de Kubernetes.

Cette étape est juste de l'observation — pas de vérification. Cliquez sur
**Suivant** une fois le Pod de remplacement apparu. →
