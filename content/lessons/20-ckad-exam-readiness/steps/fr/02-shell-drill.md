## Echauffement shell d'examen

Le vrai examen recompense une precision rapide et sans surprise. Commence par
une petite tache qui t'oblige a saisir exactement les noms, namespaces, images et
ports.

### Ta tache

Cree un namespace nomme **`ckad-ready`**.

Dedans, cree un Deployment nomme **`ready-nginx`** :

- image : `nginx:1.27`
- replicas : `1`
- port conteneur : `80`

Expose-le avec un Service nomme **`ready-nginx`** sur le port **80**.

Chemin rapide :

```bash
kubectl create namespace ckad-ready
kubectl create deployment ready-nginx -n ckad-ready --image=nginx:1.27 --port=80
kubectl expose deployment ready-nginx -n ckad-ready --port=80 --target-port=80
kubectl rollout status deployment/ready-nginx -n ckad-ready
kubectl get deploy,svc,endpoints -n ckad-ready
```

Clique sur **Verifier** quand le Deployment est disponible et que le Service a
des endpoints.
