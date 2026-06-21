## Comment fonctionne la boucle de contrôle du HPA

Pense au **HorizontalPodAutoscaler (HPA)** comme à un thermostat pour les Pods.
Trop de charge CPU ? Il ajoute des Pods. La charge baisse ? Il en retire.
Tu définis juste la température cible et les bornes min/max.

Le calcul derrière tout ca :

```text
util% = (CPU consommé par tous les pods / CPU demandé par tous les pods) x 100

util% > cible  -->  ajouter des replicas   (jusqu'a maxReplicas)
util% < cible  -->  supprimer des replicas  (jusqu'a minReplicas)
```

Deux conditions doivent être remplies avant que le HPA puisse fonctionner :

1. **metrics-server doit tourner** : il alimente le contrôleur HPA en chiffres CPU en direct.
2. **Les Pods doivent déclarer `resources.requests.cpu`** : la formule divise par la request. Sans request, pas de dénominateur, et le HPA affiche `<unknown>` indéfiniment sans jamais scaler.

> [!NOTE]
> k3s embarque metrics-server comme composant intégré. Il **tourne déjà** dans ce
> cluster : aucune installation nécessaire. `kubectl top pods` fonctionne
> immédiatement.

Vue d'ensemble :

```text
+-------------- HPA ---------------+
| cible : 50% CPU                  |
| replicas : min 1 ... max 5       |
+------------------+---------------+
                   | scale
                   v
          Deployment/web-hpa
          (cpu request : 100m)
```

> [!IMPORTANT]
> `kubectl autoscale` crée un HPA **`autoscaling/v2`** : l'API stable actuelle.
> Tu définis une utilisation cible et des bornes ; le HPA trouve le nombre
> de replicas qui t'y maintient.

Explore ce que metrics-server voit en ce moment :

```bash
kubectl top nodes
kubectl top pods --all-namespaces
```

📖 Docs : [Horizontal Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

**Passe à l'étape suivante pour mettre tout ca en pratique.**
