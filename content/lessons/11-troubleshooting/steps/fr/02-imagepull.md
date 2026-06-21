## Cas 1 : ImagePullBackOff

Un Deployment appelé `broken-img` est bloqué. Le Pod ne tourne pas. Le conteneur n'a jamais démarré. Ton rôle : lire les indices, comprendre ce qui ne va pas avec l'image, et le remettre en marche.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Deployment | `broken-img` |
| État cible | `Running` (READY `1/1`) |

Le Pod échoue à démarrer. Kubernetes réessaie avec des délais de plus en plus longs. Trouve pourquoi, corrige, et obtiens une replica disponible.

### 🔍 Comment enquêter

Commence par la colonne STATUS, puis creuse :

```bash
kubectl get pods
```

Regarde le STATUS. Ensuite, obtiens toute l'histoire :

```bash
kubectl describe pod -l app=broken-img
```

Descends jusqu'à la section **Events** en bas. Les lignes d'avertissement nomment exactement ce qui a échoué et pourquoi.

```bash
kubectl logs -l app=broken-img
```

Peu d'informations ici (le conteneur n'a jamais démarré), mais ça confirme l'état du conteneur.

```bash
kubectl get events --sort-by=.lastTimestamp
```

Ceci te donne une chronologie de tout ce qui s'est passé dans le namespace.

> [!TIP]
> Dans la section Events de `describe`, regarde la colonne `Reason` et la colonne `Message` ensemble. Le message te donne la référence exacte de l'image que Kubernetes a tenté de télécharger.

📖 Docs: [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `broken-img` est **Running** avec `1/1` ready, clique sur **Vérifier**. ✅
