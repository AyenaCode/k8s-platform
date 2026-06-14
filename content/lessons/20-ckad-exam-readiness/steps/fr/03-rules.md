## S'entrainer avec les memes contraintes

Utilise cette section CKAD avec la discipline d'examen :

- Travaille depuis le terminal et la documentation Kubernetes/Helm integree.
- Evite les recherches externes pendant une tache.
- Garde tes notes de brouillon courtes.
- Prefere `kubectl create ... --dry-run=client -o yaml` quand un manifest est
  plus rapide que tout ecrire a la main.
- Utilise les namespaces exacts. Beaucoup d'echecs CKAD sont du bon YAML applique
  au mauvais namespace.
- Avant de passer a la suite, lance un dernier `kubectl get` ou
  `kubectl describe` qui prouve que l'objectif est vrai.

Les modules suivants couvrent tous les domaines publics de la CKAD. Traite chaque
**Verifier** comme le correcteur : il inspecte l'etat du cluster, pas ton
intention.
