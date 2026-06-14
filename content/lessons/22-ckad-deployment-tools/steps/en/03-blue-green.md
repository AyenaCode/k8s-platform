## Switch traffic blue to green

Blue/green deployment is a selector exercise: run both versions, then make the
Service point at the version that should receive traffic.

### Your task

In namespace **`ckad-deploy`**:

- Deployment `shop-blue`: `1` replica, image `nginx:1.27`, labels `app=shop,track=blue`
- Deployment `shop-green`: `2` replicas, image `nginx:1.27`, labels `app=shop,track=green`
- Service `shop`: port `80`, selector **`app=shop,track=green`**

Imperative commands can get you most of the way, then patch labels/selectors:

```bash
kubectl create deployment shop-blue -n ckad-deploy --image=nginx:1.27 --replicas=1
kubectl create deployment shop-green -n ckad-deploy --image=nginx:1.27 --replicas=2
kubectl label deployment shop-blue -n ckad-deploy app=shop track=blue --overwrite
kubectl label deployment shop-green -n ckad-deploy app=shop track=green --overwrite
kubectl patch deployment shop-blue -n ckad-deploy -p '{"spec":{"template":{"metadata":{"labels":{"app":"shop","track":"blue"}}}}}'
kubectl patch deployment shop-green -n ckad-deploy -p '{"spec":{"template":{"metadata":{"labels":{"app":"shop","track":"green"}}}}}'
kubectl expose deployment shop-green -n ckad-deploy --name=shop --port=80
kubectl get endpoints shop -n ckad-deploy
```

The Service must end on green, not blue.
