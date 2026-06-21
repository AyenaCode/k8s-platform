## Déployer une nouvelle image et revenir en arrière

Mettre à jour une appli en cours sans coupure s'appelle un rolling update. Kubernetes démarre les nouveaux Pods avec la nouvelle image avant d'arrêter les anciens, donc le trafic ne tombe jamais. Tu dois trouver la bonne commande toi-même.

### 🎯 Mission

| Champ      | Valeur        |
|------------|---------------|
| Deployment | `web`         |
| Nouvelle image | `nginx:1.27` |
| Rollout    | terminé (tous les replicas ready) |

### 🔍 Comment la trouver toi-même

Tu dois mettre à jour l'image d'un Deployment en cours. Deux façons de découvrir la bonne commande :

```bash
kubectl set --help          # liste ce que "set" peut modifier
kubectl set image --help    # lis le SYNOPSIS : ressource, conteneur=image
```

Le SYNOPSIS te montre la forme : `kubectl set image <ressource> <conteneur>=<nouvelle-image>`. Pour trouver le nom du conteneur utilisé dans `web` :

```bash
kubectl get deployment web -o yaml | grep -A2 "containers:"
```

Après avoir déclenché la mise à jour, suis sa progression :

```bash
kubectl rollout status deployment/web
kubectl rollout history deployment/web
```

> [!TIP]
> Envie de pratiquer le rollback ? Une fois le rollout terminé, lance `kubectl rollout undo deployment/web` pour revenir en arrière. Vérifie ensuite `rollout history` pour voir les deux révisions.

> [!NOTE]
> `set image` crée en coulisses un nouveau ReplicaSet pour la nouvelle version et le monte en charge pendant que l'ancien descend. `maxSurge` et `maxUnavailable` dans `deployment.spec.strategy.rollingUpdate` contrôlent la cadence. Essaie `kubectl explain deployment.spec.strategy.rollingUpdate`.

📖 Docs : [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand le rollout est **terminé** avec l'image `nginx:1.27`, clique sur **Vérifier**. ✅
