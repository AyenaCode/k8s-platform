## Lancez votre premier Pod

Place à une vraie charge sur le cluster : un seul Pod nginx nommé **`web`**.

### Votre tâche

**1. Créez le Pod.** Dans le terminal à droite :

```bash
kubectl run web --image=nginx
```

Le scheduler le place sur un nœud ; le kubelet télécharge `nginx` et le démarre.

**2. Observez son démarrage** jusqu'à l'état `Running` :

```bash
kubectl get pods -w        # mises à jour en direct — Ctrl-C pour arrêter
```

Ce que « bon » donne :

```
NAME   READY   STATUS    RESTARTS   AGE
web    1/1     Running    0         20s
```

- `READY 1/1` — le conteneur est prêt et passe ses checks.
- `STATUS Running` — le processus a démarré.

> **Bloqué sur `ContainerCreating` ?** L'image se télécharge encore (premier
> pull). Patientez quelques secondes et réobservez — c'est normal, pas une erreur.

Quand `web` est **Running**, cliquez sur **Vérifier**. ✅
