## Basculer le trafic de blue vers green

Le blue/green est un exercice de selectors : les deux versions tournent, puis le
Service pointe vers la version qui doit recevoir le trafic.

### Ta tache

Dans le namespace **`ckad-deploy`** :

- Deployment `shop-blue` : `1` replica, image `nginx:1.27`, labels `app=shop,track=blue`
- Deployment `shop-green` : `2` replicas, image `nginx:1.27`, labels `app=shop,track=green`
- Service `shop` : port `80`, selector **`app=shop,track=green`**

Les commandes imperatives couvrent une grande partie, puis patch les labels/selectors :

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

Le Service doit finir sur green, pas blue.
