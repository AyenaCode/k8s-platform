## Autoriser seulement le frontend vers l'API

NetworkPolicy est une logique de labels. Selectionne les Pods cibles, puis decris
quelles sources peuvent les atteindre.

### Ta tache

Dans le namespace **`ckad-net`** :

1. Cree le Deployment `api`, image `nginx:1.27`, label `app=api`.
2. Cree le Pod `frontend`, image `busybox:1.36`, label `app=frontend`, commande `sleep 3600`.
3. Cree la NetworkPolicy **`api-allow-frontend`** :
   - `podSelector` : `app=api`
   - `policyTypes` : `Ingress`
   - autorise l'ingress depuis les Pods avec `app=frontend`
   - seulement le port TCP `80`

La verification controle la spec de policy et l'existence des deux workloads.
