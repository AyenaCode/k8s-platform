## Scaler le Deployment

Scaler, c'est une seule commande. Le Deployment demande au ReplicaSet de changer son nombre cible ; le ReplicaSet crée ou supprime des Pods immédiatement.

### Votre tâche

**1. Scalez `web` de 3 à 5 replicas :**

```bash
kubectl scale deployment web --replicas=5
```

**2. Observez les deux nouveaux Pods démarrer :**

```bash
kubectl get pods -l app=web
```

Ce que « bon » donne :

```text
NAME                READY   STATUS    RESTARTS
web-74d9c-aaaa      1/1     Running   0
web-74d9c-bbbb      1/1     Running   0
web-74d9c-cccc      1/1     Running   0
web-74d9c-dddd      1/1     Running   0
web-74d9c-eeee      1/1     Running   0
```

> [!TIP]
> Réduire fonctionne de la même façon — `--replicas=2` et Kubernetes arrête
> les Pods superflus proprement. Le contrat du Deployment est simple :
> *faire correspondre le nombre de Pods en cours au nombre désiré, toujours.*

> [!NOTE]
> En production, on scale rarement à la main. Un **HorizontalPodAutoscaler** (HPA)
> surveille CPU/mémoire et appelle `scale` pour vous — mais le mécanisme sous-jacent
> est identique à ce que vous venez d'exécuter.

Quand les **5 replicas sont ready**, puis cliquez sur **Vérifier**. ✅
