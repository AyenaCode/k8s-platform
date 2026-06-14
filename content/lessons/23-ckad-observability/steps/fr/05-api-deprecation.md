## Migrer un manifest d'API depreciee

Clique sur **Preparer**. Le setup cree un Service backend fonctionnel et ecrit un
ancien manifest Ingress dans **`/root/ckad-deprecated-ingress.yaml`**.

### Ta tache

Modifie ce fichier pour utiliser l'API Ingress actuelle :

- `apiVersion: networking.k8s.io/v1`
- `kind: Ingress`
- namespace : `ckad-observe`
- name : `legacy-ing`
- `pathType: Prefix`
- backend service name : `legacy-web`
- backend service port number : `80`

Puis applique-le :

```bash
vi /root/ckad-deprecated-ingress.yaml
kubectl apply -f /root/ckad-deprecated-ingress.yaml
kubectl get ingress legacy-ing -n ckad-observe -o yaml
```

La verification inspecte l'objet Ingress vivant.
