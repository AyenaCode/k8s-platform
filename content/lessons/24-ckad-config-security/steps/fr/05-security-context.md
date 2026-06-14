## Durcir le security context d'un Pod

Les taches SecurityContext sont des taches de champs exacts. Fais attention a
l'endroit ou chaque champ vit : security context du Pod ou du conteneur.

### Ta tache

Cree le Pod **`hardened`** dans le namespace **`ckad-sec`** :

- image : `nginxinc/nginx-unprivileged:1.27`
- Pod security context :
  - `runAsNonRoot: true`
  - `seccompProfile.type: RuntimeDefault`
- container security context :
  - `allowPrivilegeEscalation: false`
  - drop capability `ALL`

L'image nginx non privilegiee ecoute sur le port `8080`, donc elle peut tourner
sans root.
