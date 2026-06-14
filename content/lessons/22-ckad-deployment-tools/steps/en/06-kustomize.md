## Apply a Kustomize overlay

Kustomize lets you keep a base manifest and apply environment-specific changes.
The CKAD skill is being able to recognize the files and apply an overlay quickly.

### Your task

Create a Kustomize tree under **`/root/ckad-kustomize`** and apply the prod
overlay. The final cluster state must have:

- Deployment `kustom-web`
- namespace `ckad-deploy`
- image `nginx:1.27`
- replicas `2`
- label `environment=prod` on the Deployment and Pod template
- Service `kustom-web` on port `80`

One complete tree:

```bash
mkdir -p /root/ckad-kustomize/base /root/ckad-kustomize/overlays/prod
cat >/root/ckad-kustomize/base/deployment.yaml <<'YAML'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kustom-web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kustom-web
  template:
    metadata:
      labels:
        app: kustom-web
    spec:
      containers:
      - name: web
        image: nginx:1.26
        ports:
        - containerPort: 80
YAML
cat >/root/ckad-kustomize/base/service.yaml <<'YAML'
apiVersion: v1
kind: Service
metadata:
  name: kustom-web
spec:
  selector:
    app: kustom-web
  ports:
  - port: 80
    targetPort: 80
YAML
cat >/root/ckad-kustomize/base/kustomization.yaml <<'YAML'
resources:
- deployment.yaml
- service.yaml
YAML
cat >/root/ckad-kustomize/overlays/prod/kustomization.yaml <<'YAML'
namespace: ckad-deploy
resources:
- ../../base
commonLabels:
  environment: prod
replicas:
- name: kustom-web
  count: 2
images:
- name: nginx
  newTag: "1.27"
YAML
kubectl apply -k /root/ckad-kustomize/overlays/prod
```

Then verify the applied resources.
