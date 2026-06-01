## Comment fonctionne l'autoscaling

Vous avez déjà mis à l'échelle un Deployment **manuellement** avec `kubectl scale`. Mais le trafic
n'attend pas un humain. Un **HorizontalPodAutoscaler (HPA)** ajuste le nombre de replicas
**automatiquement**, en fonction de la charge.

Le HPA exécute une boucle de contrôle simple, toutes les ~15 secondes :

```
            current CPU usage (across pods)
utilization = ──────────────────────────────   ×  100
            CPU the pods REQUESTED

if utilization > target  → add replicas (up to maxReplicas)
if utilization < target  → remove replicas (down to minReplicas)
```

Deux prérequis rendent cela possible :

1. **metrics-server** doit être en cours d'exécution — il fournit les valeurs CPU/mémoire en temps réel.
   Vous l'avez déjà activé (c'est ce que `kubectl top pods` lit).
2. Les Pods cibles **doivent déclarer `resources.requests.cpu`**. Toute la formule
   divise par la demande — sans demande, il n'y a pas de dénominateur. Un HPA sur des Pods
   sans requests affiche `<unknown>` indéfiniment et ne scale jamais.

```
   ┌──────────── HPA ────────────┐
   │ watch CPU vs target (50%)   │
   │ adjust replicas 1 … 5       │
   └──────────────┬──────────────┘
                  ▼  scales
            Deployment web-hpa
```

> **Idée clé :** vous définissez une **utilisation cible** et des **limites** ; le HPA trouve le
> nombre de replicas qui vous y maintient. Définissez les CPU requests, sinon il ne peut pas
> fonctionner.

Dans cette leçon, vous allez attacher un HPA à un Deployment pré-créé (qui déclare déjà des
CPU requests) et observer la lecture des métriques en temps réel. →
