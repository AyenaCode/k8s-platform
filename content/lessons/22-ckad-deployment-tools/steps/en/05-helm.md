## Install a local Helm chart

The exam can expect Helm literacy. You do not need an external chart repository
for this drill; generate a local chart and install it.

### Your task

Create a chart at **`/root/ckad-chart`** and install release **`ckad-demo`** in
namespace **`ckad-deploy`**:

- replicas: `2`
- image repository: `nginx`
- image tag: `1.27`
- service port: `8080`

Commands:

```bash
rm -rf /root/ckad-chart
helm create /root/ckad-chart
helm upgrade --install ckad-demo /root/ckad-chart -n ckad-deploy \
  --set replicaCount=2 \
  --set image.repository=nginx \
  --set image.tag=1.27 \
  --set service.port=8080
helm status ckad-demo -n ckad-deploy
kubectl get deploy,svc -n ckad-deploy -l app.kubernetes.io/instance=ckad-demo
```

Wait until the release Deployment is available.
