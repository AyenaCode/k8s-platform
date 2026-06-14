## Install a local Helm chart

The exam can expect Helm literacy. You do not need an external chart repository
for this drill; generate a local chart and install it.

### Your task

Create a chart at **`/root/ckad-chart`** and install release **`ckad-demo`** in
namespace **`ckad-deploy`**:

- replicas: `2`
- image repository: `nginxinc/nginx-unprivileged`
- image tag: `1.27`
- service port: `8080`

> [!NOTE]
> The default `helm create` chart wires the container port **and** its
> readiness/liveness probes to `service.port`. With `service.port=8080` the
> probes hit `:8080`, so the image must actually listen there. Stock `nginx`
> listens on `80` and would never become Ready; `nginxinc/nginx-unprivileged`
> listens on `8080`, so the release comes up healthy.

Commands:

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

Wait until the release Deployment is available.
