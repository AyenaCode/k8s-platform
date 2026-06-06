## Attacher un HorizontalPodAutoscaler à un Deployment

La plateforme a pré-créé **`web-hpa`** — un Deployment avec une **CPU request de
100m** déjà déclarée. C'est le dénominateur que le HPA utilise dans son calcul ;
sans lui, l'autoscaler est aveugle.

### Votre tâche

**1. Vérifiez que le Deployment est prêt et que les métriques arrivent.**

```bash
kubectl get deploy web-hpa
kubectl top pods -l app=web-hpa
```

> [!NOTE]
> Si `kubectl top pods` renvoie `<unknown>`, attendez ~15 s et relancez —
> metrics-server collecte à intervalle court.

**2. Attachez l'autoscaler.** Cible : **50% de CPU moyen**, entre **1 et 5** replicas :

```bash
kubectl autoscale deployment web-hpa --cpu=50% --min=1 --max=5
```

**3. Observez le HPA jusqu'à ce que TARGETS affiche un vrai pourcentage.**

```bash
kubectl get hpa web-hpa -w
```

Ce que « bon » donne :

```text
NAME      REFERENCE             TARGETS          MINPODS  MAXPODS  REPLICAS
web-hpa   Deployment/web-hpa   cpu: <unknown>/50%   1        5        1   ← 30 premières s
web-hpa   Deployment/web-hpa   cpu: 0%/50%          1        5        1   ← métriques actives
```

`cpu: 0%/50%` signifie : actuel 0%, cible 50%. L'application est inactive, donc
1 replica suffit. Sous vraie charge, le HPA augmente les REPLICAS vers `max`, puis
redescend une fois le pic terminé.

> [!TIP]
> **Générez de la charge pour voir le scaling :** exécutez une boucle occupée
> directement dans le pod `web-hpa` pour que le HPA voie sa CPU augmenter —
> `kubectl exec deploy/web-hpa -- sh -c "while true; do :; done"` —
> puis regardez `kubectl get hpa -w` monter les REPLICAS. La descente est
> volontairement lente (fenêtre de stabilisation) pour éviter les oscillations.

> [!WARNING]
> Un `<unknown>` qui ne se résout jamais indique que les Pods n'ont pas de CPU
> request. Le script de setup positionne déjà `requests.cpu: 100m` sur `web-hpa`,
> donc cela ne devrait pas arriver — mais si c'est le cas, consultez
> `kubectl describe hpa web-hpa` pour en trouver la cause.

**4. Confirmez que le HPA est sain.**

```bash
kubectl describe hpa web-hpa | grep -i "metrics\|able to"
```

Quand TARGETS affiche un **vrai `%/50%`** (pas `<unknown>`), cliquez sur
**Vérifier**. ✅
