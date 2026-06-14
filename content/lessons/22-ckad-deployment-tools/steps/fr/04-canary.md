## Executer un canary par ratio de replicas

Les Services Kubernetes ne font pas de routage pondere seuls. Un canary simple
peut etre represente par deux Deployments derriere un meme selector : beaucoup
de replicas stables, peu de replicas canary.

### Ta tache

Dans le namespace **`ckad-deploy`** :

- Deployment `web-stable` : `4` replicas, image `nginx:1.27`, labels `app=web,track=stable`
- Deployment `web-canary` : `1` replica, image `nginx:1.27`, labels `app=web,track=canary`
- Service `web` : port `80`, selector **seulement** `app=web`

Le Service doit voir des endpoints issus des deux Deployments.
