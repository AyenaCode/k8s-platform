## Exposer une app avec Ingress

Clique sur **Preparer**. Le setup cree le Deployment et le Service
**`ingress-web`**.

### Ta tache

Cree l'Ingress **`ckad-web`** dans le namespace **`ckad-net`** :

- host : `ckad.localhost`
- path : `/`
- pathType : `Prefix`
- backend service : `ingress-web`
- backend service port : `80`

Exemple :

```bash
kubectl create ingress ckad-web -n ckad-net \
  --rule='ckad.localhost/=ingress-web:80'
kubectl get ingress ckad-web -n ckad-net -o yaml
```

Si tu veux tester via Traefik :

```bash
curl -H 'Host: ckad.localhost' http://localhost/
```

Puis verifie.
