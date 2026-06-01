## Rolling update & rollback

Déployez une nouvelle image **sans coupure**. Le conteneur du Deployment `web`
s'appelle `nginx` (comme l'image). Mettez-le à jour vers une version fixée :

```bash
kubectl set image deployment/web nginx=nginx:1.27
```

Regardez le rollout remplacer les Pods progressivement — les nouveaux démarrent
*avant* que les anciens s'arrêtent, donc l'app ne tombe jamais :

```bash
kubectl rollout status deployment/web
```

Consultez l'historique, et revenez en arrière instantanément si besoin :

```bash
kubectl rollout history deployment/web
kubectl rollout undo deployment/web      # retour à la version précédente
```

> Un rolling update crée un **nouveau ReplicaSet** et bascule les Pods quelques-uns
> à la fois (réglé par `maxSurge` / `maxUnavailable`). Le rollback ne fait que
> remonter l'ancien ReplicaSet.

Mettez l'image à **`nginx:1.27`**, attendez la fin du rollout, puis cliquez sur
**Vérifier**. ✅
