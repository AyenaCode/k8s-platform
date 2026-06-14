## Reparer un conteneur qui crash

Clique sur **Preparer**. Un Deployment nomme **`bad-command`** va se mettre a
crasher. Ton travail est de diagnostiquer depuis l'etat du cluster et corriger
la commande.

### Ta tache

Utilise :

```bash
kubectl get pods -n ckad-observe
kubectl describe pod -n ckad-observe -l app=bad-command
kubectl logs -n ckad-observe -l app=bad-command --previous
```

Puis patch le Deployment pour que le conteneur reste en vie. Par exemple :

```bash
kubectl patch deployment bad-command -n ckad-observe --type=json \
  -p='[{"op":"replace","path":"/spec/template/spec/containers/0/command","value":["/bin/sh","-c","sleep 3600"]}]'
kubectl rollout status deployment/bad-command -n ckad-observe
```

Verifie quand le Deployment a un replica disponible.
