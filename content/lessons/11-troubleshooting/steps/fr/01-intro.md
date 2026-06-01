## La méthode de débogage

Quand un Pod se comporte mal, deviner est lent. Les bons opérateurs suivent **les mêmes trois
étapes à chaque fois**, de l'extérieur vers l'intérieur :

```bash
kubectl get pods            # 1. What is the STATUS? (the headline symptom)
kubectl describe pod <name> # 2. Read the Events at the bottom (the WHY)
kubectl logs <name>         # 3. What did the app itself say? (--previous for a crashed one)
```

La plupart des problèmes s'annoncent dans la colonne **STATUS**. Apprenez à la lire :

| STATUS | Signifie généralement |
|---|---|
| `ImagePullBackOff` / `ErrImagePull` | nom d'image ou tag incorrect, ou pas d'accès au registre |
| `CrashLoopBackOff` | le conteneur démarre puis s'arrête — mauvaise commande, dépendance manquante, config en échec |
| `OOMKilled` | a dépassé sa limite mémoire (vous l'avez vu dans la leçon sur les Ressources) |
| `CreateContainerConfigError` | fait référence à une ConfigMap/Secret ou une clé qui n'existe pas |
| `Pending` | ne peut pas être planifié — pas assez de CPU/mémoire, ou aucun nœud correspondant |
| `Running` mais `0/1` ready | une readiness probe échoue (ou, pour un Service, pas d'endpoints) |

> **Idée clé :** `get` donne le symptôme, `describe` donne la cause (dans les Events),
> `logs` donne le récit de l'application elle-même. Procédez toujours dans cet ordre.

Dans cet atelier, la plateforme va **casser trois Pods intentionnellement**. Pour chacun, cliquez
**Préparer la tâche**, diagnostiquez-le avec les trois commandes, puis corrigez-le et cliquez **Vérifier**.
→
