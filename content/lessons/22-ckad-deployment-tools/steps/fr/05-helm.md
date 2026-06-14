## Installer un chart Helm local

L'examen peut attendre une aisance avec Helm. Pour ce drill, tu n'as pas besoin
d'un repository externe : genere un chart local et installe-le.

### Ta tache

Cree un chart dans **`/root/ckad-chart`** et installe la release
**`ckad-demo`** dans le namespace **`ckad-deploy`** :

- replicas : `2`
- image repository : `nginxinc/nginx-unprivileged`
- image tag : `1.27`
- service port : `8080`

> [!NOTE]
> Le chart par defaut de `helm create` cable le port du conteneur **et** ses
> probes readiness/liveness sur `service.port`. Avec `service.port=8080`, les
> probes interrogent `:8080`, donc l'image doit reellement ecouter la. Le `nginx`
> standard ecoute sur `80` et ne serait jamais Ready ; `nginxinc/nginx-unprivileged`
> ecoute sur `8080`, donc la release demarre saine.

Commandes :

```bash
rm -rf /root/ckad-chart
helm create /root/ckad-chart
helm upgrade --install ckad-demo /root/ckad-chart -n ckad-deploy \
  --set replicaCount=2 \
  --set image.repository=nginxinc/nginx-unprivileged \
  --set image.tag=1.27 \
  --set service.port=8080
helm status ckad-demo -n ckad-deploy
kubectl get deploy,svc -n ckad-deploy -l app.kubernetes.io/instance=ckad-demo
```

Attends que le Deployment de la release soit disponible.
