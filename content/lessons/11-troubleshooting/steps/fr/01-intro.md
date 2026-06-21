## Maîtriser la boucle de débogage

Imagine-toi comme un détective sur une scène de crime. Tu ne touches rien avant d'avoir lu tous les indices. Dans Kubernetes, les indices sont toujours au même endroit.

```bash
kubectl get pods                      # 1. Repérer le STATUS (le symptôme principal)
kubectl describe pod <name>           # 2. Lire la section Events en bas
kubectl logs <name>                   # 3. Écouter l'application (ajoute --previous après un crash)
```

La colonne **STATUS** te dit dans quelle catégorie de problème tu te trouves avant même d'ouvrir un seul log :

| STATUS | Ce que ça signale |
|--------|-------------------|
| `ImagePullBackOff` / `ErrImagePull` | Quelque chose cloche dans la référence de l'image |
| `CrashLoopBackOff` | Le conteneur démarre mais s'arrête immédiatement |
| `OOMKilled` | Le conteneur a dépassé sa limite mémoire |
| `CreateContainerConfigError` | Une clé de ConfigMap ou de Secret introuvable |
| `Pending` | Aucun nœud n'a accepté le Pod |
| `Running` mais `0/1` Ready | Le conteneur tourne, mais quelque chose ne va pas encore |

> [!IMPORTANT]
> `get` montre le symptôme. `describe` montre les indices (descends jusqu'à **Events**). `logs` donne la voix de l'application elle-même. Exécute-les toujours dans cet ordre. Ne saute pas d'étapes.

La plateforme va casser trois workloads intentionnellement. Pour chacun : clique sur **Préparer la tâche**, lis les indices, comprends ce qui ne va pas, corrige, puis clique sur **Vérifier**.

**Continuer →**
