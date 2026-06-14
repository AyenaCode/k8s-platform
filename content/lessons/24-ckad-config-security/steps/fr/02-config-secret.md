## Injecter ConfigMaps et Secrets

Les ConfigMaps portent la configuration non sensible. Les Secrets portent les
valeurs sensibles, mais necessitent quand meme un controle d'acces Kubernetes
normal. La competence est de les brancher dans le Pod.

### Ta tache

Dans le namespace **`ckad-sec`** :

- ConfigMap `app-settings` avec `MODE=prod`
- Secret `db-secret` avec `PASSWORD=ckad-pass`
- Pod `secure-app`, image `busybox:1.36`, commande `sleep 3600`
- le Pod doit recevoir les deux ressources via `envFrom`

Commandes :

```bash
kubectl create namespace ckad-sec
kubectl create configmap app-settings -n ckad-sec --from-literal=MODE=prod
kubectl create secret generic db-secret -n ckad-sec --from-literal=PASSWORD=ckad-pass
```

Puis cree le YAML du Pod avec :

```yaml
envFrom:
- configMapRef:
    name: app-settings
- secretRef:
    name: db-secret
```

Verifie apres que `kubectl exec secure-app -n ckad-sec -- printenv MODE PASSWORD`
affiche les valeurs attendues.
