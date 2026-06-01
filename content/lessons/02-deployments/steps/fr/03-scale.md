## Scaler

Scaler, c'est changer un seul nombre. Faites passer `web` de 3 à **5** replicas :

```bash
kubectl scale deployment web --replicas=5
```

Observez deux nouveaux Pods apparaître :

```bash
kubectl get pods -l app=web
```

Vous pouvez réduire tout aussi facilement (`--replicas=2`) — Kubernetes arrête les
Pods en trop. Le rôle du Deployment est simple : *faire correspondre le nombre de
Pods en cours d'exécution au nombre désiré*, toujours.

> En production on scale rarement à la main — un **HorizontalPodAutoscaler**
> surveille CPU/mémoire et scale pour vous. Mais le mécanisme sous-jacent est le
> même.

Scalez `web` à **5 replicas**, attendez que les 5 soient ready, puis cliquez sur
**Vérifier**. ✅
