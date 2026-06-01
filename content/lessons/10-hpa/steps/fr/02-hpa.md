## Attacher un HorizontalPodAutoscaler

La plateforme a pré-créé un Deployment nommé **`web-hpa`** qui déclare déjà une
**CPU request de 100m** — la base dont le HPA a besoin. Cliquez **Préparer la tâche** si ce n'est
pas fait. Confirmez sa présence et que les métriques circulent :

```bash
kubectl get deploy web-hpa
kubectl top pods -l app=web-hpa        # shows live CPU — metrics-server is working
```

Attachez maintenant un autoscaler : maintenez la CPU moyenne près de **50%**, entre **1 et 5**
replicas :

```bash
kubectl autoscale deployment web-hpa --cpu=50% --min=1 --max=5
```

Examinez-le. Pendant les premières ~15–30 secondes, la colonne TARGETS affiche **`<unknown>`** —
le HPA n'a pas encore reçu d'échantillon de métriques. **Attendez**, et elle devient un vrai
pourcentage :

```bash
kubectl get hpa web-hpa
# NAME      REFERENCE             TARGETS         MINPODS  MAXPODS  REPLICAS
# web-hpa   Deployment/web-hpa    cpu: <unknown>/50%   1    5    1     ← at first
# web-hpa   Deployment/web-hpa    cpu: 0%/50%          1    5    1     ← after ~30s
```

`cpu: 0%/50%` signifie *actuel 0%, cible 50%* — l'application est inactive, donc 1 replica
suffit. Sous charge réelle, le HPA ajouterait des replicas jusqu'à `max`.

> **À essayer chez vous :** générez de la charge CPU (ex. une boucle `while true` dans un pod
> occupé) et regardez `kubectl get hpa -w` augmenter les REPLICAS, puis redescendre une fois
> arrêtée. La diminution est intentionnellement lente (une fenêtre de stabilisation) pour éviter
> les oscillations.

Confirmez que la boucle est saine — `<unknown>` doit avoir disparu :

```bash
kubectl describe hpa web-hpa | grep -i "metrics\|able to"
```

Lorsque les TARGETS de `web-hpa` affichent un **vrai `%/50%`** (pas `<unknown>`), cliquez
**Vérifier**. ✅
