## S'entrainer au format public CKAD

La CKAD est un examen pratique pour developpeurs Kubernetes. Les informations
publiques de la Linux Foundation indiquent que l'examen est en ligne, surveille,
base sur la performance, et compose de taches a resoudre en ligne de commande
dans un environnement Kubernetes. La duree publique est de **2 heures** et la
version logicielle listee est **Kubernetes v1.35**.

Ce parcours suit les poids publics du curriculum :

| Domaine | Poids |
|---|---:|
| Application Design and Build | 20% |
| Application Deployment | 20% |
| Application Observability and Maintenance | 15% |
| Application Environment, Configuration and Security | 25% |
| Services and Networking | 20% |

Les exercices ici sont des **drills originaux**, pas des questions d'examen
copiees ou divulguees. Ils imitent le travail attendu : objectif clair, vrai
cluster, noms de ressources stricts et verification automatique.

### L'habitude a construire

Pour chaque tache :

1. Lis les noms exacts des ressources et du namespace.
2. Cree le YAML ou la commande imperative valide le plus rapidement possible.
3. Verifie avec `kubectl get`, `kubectl describe`, `kubectl logs`, `kubectl auth can-i` ou `curl`.
4. Ensuite seulement, clique sur **Verifier**.

La vitesse compte, mais la validation propre compte encore plus.
