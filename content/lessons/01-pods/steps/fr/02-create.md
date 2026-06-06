## Lance ton premier Pod

Place à une vraie charge sur le cluster : un seul Pod nginx nommé **`web`**.

### Ta tâche

**1. Crée le Pod.** Dans le terminal :

```bash
kubectl run web --image=nginx
```

Le scheduler le place sur un nœud ; le kubelet télécharge `nginx` et le démarre.

**2. Observe son démarrage** jusqu'à l'état `Running` :

```bash
kubectl get pods -w        # mises à jour en direct, Ctrl-C pour arrêter
```

Ce que « bon » donne :

```
NAME   READY   STATUS    RESTARTS   AGE
web    1/1     Running    0         20s
```

- `READY 1/1` : le conteneur est prêt et passe ses checks.
- `STATUS Running` : le processus a démarré.

> [!TIP]
> **Bloqué sur `ContainerCreating` ?** L'image se télécharge encore (premier pull).
> Patiente quelques secondes et réobserve, c'est normal, pas une erreur.

Quand `web` est **Running**, clique sur **Vérifier**. ✅
