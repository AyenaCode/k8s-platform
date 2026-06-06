## Déployer une nouvelle image et revenir en arrière

Déployez une nouvelle image de conteneur sans coupure. Kubernetes remplace les Pods quelques-uns à la fois — les nouveaux démarrent avant que les anciens s'arrêtent — le trafic ne chute jamais.

### Votre tâche

**1. Mettez à jour le conteneur `nginx` vers une version fixée :**

```bash
kubectl set image deployment/web nginx=nginx:1.27
```

> [!NOTE]
> Le nom de conteneur `nginx` (avant le `=`) doit correspondre à ce qui est dans
> le pod template du Deployment. Il a été défini lors du `create deployment --image=nginx`.

**2. Suivez la progression du rollout Pod par Pod :**

```bash
kubectl rollout status deployment/web
```

Ce que « bon » donne :

```text
Waiting for deployment "web" rollout to finish: 2 out of 5 new replicas updated...
Waiting for deployment "web" rollout to finish: 4 out of 5 new replicas updated...
deployment "web" successfully rolled out
```

**3. Consultez l'historique et entraînez-vous au rollback :**

```bash
kubectl rollout history deployment/web
kubectl rollout undo deployment/web      # retour à l'image précédente
```

> [!TIP]
> `set image` crée en coulisses un **nouveau ReplicaSet** qui tourne avec `nginx:1.27`
> et le monte en charge pendant que l'ancien descend. `undo` inverse l'opération :
> l'ancien ReplicaSet remonte, le nouveau redescend à zéro.
> `maxSurge` et `maxUnavailable` (dans le spec du Deployment) règlent la cadence.

> [!WARNING]
> `--record` (ex. `kubectl apply --record`) est **déprécié** — ne l'utilisez pas.
> Utilisez `kubectl annotate` ou fiez-vous à `rollout history` sans cet indicateur.

Mettez l'image à **`nginx:1.27`**, attendez la fin du rollout, puis cliquez sur **Vérifier**. ✅
