## Maîtriser la boucle de débogage

Chaque incident en production commence par les mêmes trois gestes, de l'extérieur vers l'intérieur.

```bash
kubectl get pods              # 1. Repérer le STATUS (le symptôme principal)
kubectl describe pod <name>   # 2. Lire la section Events (la cause)
kubectl logs <name>           # 3. Écouter ce qu'a dit l'application (--previous après un crash)
```

La colonne **STATUS** révèle la catégorie du problème avant même de lire un seul log :

| STATUS | Ce que ça signifie |
|---|---|
| `ImagePullBackOff` / `ErrImagePull` | Nom d'image, tag incorrect, ou identifiants manquants |
| `CrashLoopBackOff` | Le conteneur démarre puis s'arrête : mauvaise commande, dépendance absente, config défaillante |
| `OOMKilled` | Le conteneur a dépassé sa limite mémoire et a été tué |
| `CreateContainerConfigError` | Référence à une clé de ConfigMap / Secret inexistante |
| `Pending` | Ne peut pas être schedulé : aucun nœud avec assez de CPU/mémoire |
| `Running` mais `0/1` ready | Readiness probe en échec, ou, pour un Service, aucun endpoint |

> [!IMPORTANT]
> `get` expose le symptôme. `describe` donne la cause (descends jusqu'à **Events** en bas). `logs` raconte l'histoire de l'application elle-même. Exécute-les toujours dans cet ordre : ne saute pas d'étape.

C'est la leçon finale. La plateforme va **casser trois workloads intentionnellement**. Pour chacun :
clique sur **Préparer la tâche** → diagnostique avec les trois commandes → corrige → clique sur **Vérifier**.

**Continuer →**
