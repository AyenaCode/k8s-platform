## Cas 1 : ImagePullBackOff

Cliquez **Préparer la tâche** pour le casser. Un Deployment nommé **`broken-img`** est créé.
Diagnostiquez :

```bash
kubectl get pods
# broken-img-xxxx   0/1   ImagePullBackOff   0   30s
```

`ImagePullBackOff` signifie que le kubelet ne peut pas télécharger l'image. Lisez les Events pour
connaître la raison exacte :

```bash
kubectl describe pod -l app=broken-img | tail -n 15
# Warning  Failed   ... Failed to pull image "nginx:doesnotexist99999": ...
# Warning  Failed   ... Error: ErrImagePull
# Warning  BackOff  ... Back-off pulling image "nginx:doesnotexist99999"
```

Voilà — le tag `doesnotexist99999` n'est pas un vrai tag nginx, donc le pull échoue et Kubernetes
recule et réessaie. (Le même symptôme apparaît pour une faute de frappe dans le nom de l'image,
un registre privé sans identifiants, ou un digest incorrect.)

**Corrigez-le** — ré-appliquez le Deployment avec une vraie image. Même nom, tag valide :

```bash
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: broken-img
spec:
  replicas: 1
  selector:
    matchLabels:
      app: broken-img
  template:
    metadata:
      labels:
        app: broken-img
    spec:
      containers:
      - name: app
        image: nginx:1.27        # <- a tag that actually exists
EOF
```

Observez la récupération :

```bash
kubectl get pods -l app=broken-img -w     # -> 1/1 Running, then Ctrl-C
```

Lorsque `broken-img` a un Pod **Running**, cliquez **Vérifier**. ✅
