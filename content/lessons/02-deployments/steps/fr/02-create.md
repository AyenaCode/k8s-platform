## Créer un Deployment

Créez un Deployment nommé **`web`** qui fait tourner **3 replicas** de nginx :

```bash
kubectl create deployment web --image=nginx --replicas=3
```

Observez le ReplicaSet démarrer les trois Pods :

```bash
kubectl get deploy,rs,pods
```

Vous devriez voir :

```
deployment.apps/web   3/3     3            3
replicaset.apps/web-xxxx   3   3   3
pod/web-xxxx-aaaa   1/1   Running
pod/web-xxxx-bbbb   1/1   Running
pod/web-xxxx-cccc   1/1   Running
```

Remarquez les noms de Pods : `web-<replicaset>-<aléatoire>`. Le Deployment a créé
un ReplicaSet, qui a créé les Pods.

Quand **`web` affiche 3/3 ready**, cliquez sur **Vérifier**. ✅
