## Attacher un HorizontalPodAutoscaler à un Deployment

Le script de setup a pré-créé **`web-hpa`** : un Deployment qui déclare déjà une CPU request.
C'est le nombre que le HPA utilise comme dénominateur. Sans lui, l'autoscaler est aveugle.

### 🎯 Mission

| Champ | Valeur |
|---|---|
| Kind | HorizontalPodAutoscaler |
| Nom | `web-hpa` |
| Deployment cible | `web-hpa` |
| Utilisation CPU cible | `50%` |
| Replicas min | `1` |
| Replicas max | `5` |

Le HPA doit lire une vraie métrique CPU (TARGETS affiche `%/50%`, pas `<unknown>`).

### 🔍 Comment la trouver toi-même

D'abord, vérifie que le Deployment est prêt et que les métriques arrivent :

```bash
kubectl get deploy web-hpa
kubectl top pods -l app=web-hpa
```

Tu dois maintenant créer le HPA. Quel verbe `kubectl` attache un autoscaler à un Deployment ? Demande à l'outil :

```bash
kubectl autoscale --help
```

Lis le SYNOPSIS et les exemples. Tu verras les flags dont tu as besoin : le nom du deployment cible, le seuil CPU et les bornes de replicas. Construis ta propre commande à partir de la.

Une fois le HPA créé, observe-le jusqu'à ce que TARGETS affiche un vrai pourcentage :

```bash
kubectl get hpa web-hpa -w
kubectl describe hpa web-hpa
```

> [!NOTE]
> `<unknown>` pendant les 15-30 premières secondes est normal : metrics-server collecte
> à intervalle court. Attends et observe. Si ca ne se résout jamais, consulte
> `kubectl describe hpa web-hpa` pour voir les événements d'erreur.

> [!TIP]
> Tu veux voir le HPA réagir ? Lance une boucle CPU intensive dans le pod et regarde
> les replicas augmenter :
> `kubectl exec deploy/web-hpa -- sh -c "while true; do :; done"`
> Puis surveille `kubectl get hpa -w`. La descente est volontairement lente pour
> éviter les oscillations.

📖 Docs : [Horizontal Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/) · [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand TARGETS affiche un vrai **`%/50%`** (pas `<unknown>`), clique sur **Vérifier**. ✅
