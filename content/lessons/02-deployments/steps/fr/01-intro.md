## Pourquoi les Deployments ?

Un Pod seul, c'est comme un post-it : arrache-le, il disparaît. Un **Deployment**, c'est un contrat : tu dis « je veux 3 copies de nginx », et Kubernetes applique ce contrat sans relâche.

Sous le capot, un Deployment crée un ReplicaSet, qui crée les Pods :

```text
Deployment
  └─gère─▶ ReplicaSet
             └─gère─▶ Pod(s)
(tu édites) (auto-créé)  (conteneurs)
```

Tu interagis uniquement avec le Deployment. Le ReplicaSet a un seul rôle : « maintenir exactement N Pods vivants ».

- **Auto-réparation** : un Pod meurt, un remplaçant arrive. Aucune action requise.
- **Scaling** : change un seul nombre, Kubernetes ajuste le compte immédiatement.
- **Rolling update** : change d'image sans coupure ; annule en une commande.

> [!NOTE]
> Le groupe d'API stable est `apps/v1`. Tu verras `deployment.apps/web` dans la sortie de `kubectl get`. C'est normal.

Explore la structure de la ressource avant de commencer :

```bash
kubectl explain deployment --recursive
kubectl explain deployment.spec.strategy
```

📖 Docs : [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

**Continuer →**
