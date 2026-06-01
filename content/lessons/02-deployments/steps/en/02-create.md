## Create a Deployment

Create a Deployment named **`web`** running **3 replicas** of nginx:

```bash
kubectl create deployment web --image=nginx --replicas=3
```

Watch the ReplicaSet bring up three Pods:

```bash
kubectl get deploy,rs,pods
```

You should see:

```
deployment.apps/web   3/3     3            3
replicaset.apps/web-xxxx   3   3   3
pod/web-xxxx-aaaa   1/1   Running
pod/web-xxxx-bbbb   1/1   Running
pod/web-xxxx-cccc   1/1   Running
```

Notice the Pod names: `web-<replicaset>-<random>`. The Deployment created a
ReplicaSet, which created the Pods.

When **`web` shows 3/3 ready**, click **Verify**. ✅
