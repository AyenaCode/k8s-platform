## Appliquer un overlay Kustomize

Kustomize permet de garder un manifest de base et d'appliquer des changements
propres a un environnement. La competence CKAD consiste a reconnaitre les
fichiers et appliquer rapidement un overlay.

### Ta tache

Cree une arborescence Kustomize sous **`/root/ckad-kustomize`** et applique
l'overlay prod. L'etat final du cluster doit contenir :

- Deployment `kustom-web`
- namespace `ckad-deploy`
- image `nginx:1.27`
- replicas `2`
- label `environment=prod` sur le Deployment et le template Pod
- Service `kustom-web` sur le port `80`

Arborescence complete :

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

Puis verifie les ressources appliquees.
