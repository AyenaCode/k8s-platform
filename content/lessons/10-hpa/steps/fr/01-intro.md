## Comprendre la boucle de contrôle du HPA

Les pics de trafic n'attendent pas un humain. Le **HorizontalPodAutoscaler (HPA)**
ajuste automatiquement le nombre de replicas d'un Deployment toutes les ~15 secondes,
en fonction de la charge observée.

Le calcul est simple :

```text
         CPU consommé actuellement (tous les pods)
util% = ──────────────────────────────────────────── × 100
         CPU demandé par les pods (requests)

util% > cible  →  ajouter des replicas   (jusqu'à maxReplicas)
util% < cible  →  supprimer des replicas  (jusqu'à minReplicas)
```

Deux conditions doivent être remplies avant que le HPA puisse fonctionner :

1. **metrics-server doit tourner** : il alimente le HPA en chiffres CPU en direct.
2. **Les Pods doivent déclarer `resources.requests.cpu`** : la formule divise par
   la request. Sans request → pas de dénominateur → le HPA affiche `<unknown>`
   indéfiniment et ne scale jamais.

> [!NOTE]
> k3s embarque metrics-server comme composant intégré. Il **tourne déjà** dans ce
> cluster : aucune installation nécessaire. `kubectl top pods` fonctionne
> immédiatement.

Vue d'ensemble :

```text
┌──────────── HPA ─────────────┐
│ cible : 50% CPU              │
│ replicas : min 1 … max 5     │
└──────────────┬───────────────┘
               │ scale
               ▼
       Deployment/web-hpa
       (cpu request : 100m)
```

> [!IMPORTANT]
> `kubectl autoscale` crée un HPA **`autoscaling/v2`** : l'API stable actuelle.
> Tu définis une utilisation cible et des bornes ; le HPA trouve le nombre
> de replicas qui t'y maintient.

À l'étape suivante tu attacheras un HPA à un Deployment pré-créé et le
regarderas s'animer avec de vraies métriques.

**Continuer →**
