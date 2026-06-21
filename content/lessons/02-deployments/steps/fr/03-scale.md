## Scaler le Deployment

Scaler, c'est changer le nombre de replicas désiré. Le Deployment le dit au ReplicaSet, qui crée ou supprime des Pods immédiatement. C'est comme dire à un manager « embauche 2 personnes de plus » : le manager s'occupe du reste.

### 🎯 Mission

| Champ      | Valeur |
|------------|--------|
| Deployment | `web`  |
| Replicas   | `5` (tous Running) |

### 🔍 Comment la trouver toi-même

Il existe un verbe `kubectl` conçu exactement pour changer le nombre de replicas :

```bash
kubectl scale --help
```

Lis la ligne SYNOPSIS. Elle te donne le type de ressource, le nom et le flag nécessaire.

Vérifie le résultat ensuite :

```bash
kubectl get pods -l app=web
kubectl get deployment web
```

> [!TIP]
> Réduire fonctionne pareil : donne un nombre plus petit et Kubernetes arrête les Pods superflus proprement.

📖 Docs : [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand les **5 replicas sont ready**, clique sur **Vérifier**. ✅
