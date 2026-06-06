## Diagnostiquer et corriger un ImagePullBackOff

La plateforme vient de déployer `broken-img` avec un tag qui n'existe pas. Rien ne tournera tant que vous n'aurez pas corrigé l'image.

### Diagnostiquer

**1. Repérer le symptôme** — scannez la colonne STATUS :

```bash
kubectl get pods
```

```text
NAME                          READY   STATUS             RESTARTS   AGE
broken-img-7d9f6b8c5-xk2pq   0/1     ImagePullBackOff   0          30s
```

`ImagePullBackOff` — le kubelet a tenté de télécharger l'image, a échoué, et est en back-off (il attend de plus en plus longtemps entre chaque tentative).

**2. Lire les Events** — trouvez la raison exacte :

```bash
kubectl describe pod -l app=broken-img
```

Descendez jusqu'à la section **Events** en bas :

```text
Warning  Failed   ...  Failed to pull image "nginx:doesnotexist99999": ...
Warning  Failed   ...  Error: ErrImagePull
Warning  BackOff  ...  Back-off pulling image "nginx:doesnotexist99999"
```

Le tag `doesnotexist99999` n'est pas un vrai tag nginx. Le pull échoue. Kubernetes recule et réessaie — indéfiniment, jusqu'à ce que vous corrigiez le problème.

> [!NOTE]
> Le même symptôme apparaît pour une faute de frappe dans le nom d'image, un registre privé avec des identifiants manquants, ou un digest incorrect. Le message dans **Events** vous indique lequel.

**3. Vérifier les logs** — rien d'utile ici (le conteneur n'a jamais démarré), mais ça vaut la peine de confirmer :

```bash
kubectl logs -l app=broken-img
```

```text
Error from server (BadRequest): container "app" in pod "..." is waiting to start: trying and failing to pull image
```

### Votre tâche

**1. Ré-appliquer le Deployment** avec un tag d'image valide — conservez le même nom de Deployment :

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
        image: nginx:1.27        # tag valide — celui-ci sera téléchargé
EOF
```

**2. Observer la récupération du Pod :**

```bash
kubectl get pods -l app=broken-img -w
```

```text
NAME                          READY   STATUS    RESTARTS   AGE
broken-img-6c8d7f9b4-p9mkx   1/1     Running   0          12s
```

> [!TIP]
> `ImagePullBackOff` s'affiche encore juste après l'apply ? Kubernetes est toujours dans la fenêtre de back-off. Patientez jusqu'à 5 minutes — l'intervalle de retry peut atteindre 5 min maximum. Faites Ctrl-C puis relancez `kubectl get pods`.

Puis cliquez sur **Vérifier**. ✅
