## Capturer les logs comme preuve

Le setup cree un Deployment nomme **`logger`** qui ecrit regulierement une ligne
`health=ok`. En mode examen, les logs sont souvent le chemin le plus rapide pour
prouver le symptome.

### Ta tache

Clique sur **Preparer**, puis capture les derniers logs et stocke-les dans la
ConfigMap **`logger-snapshot`** du namespace **`ckad-observe`**, sous la cle
`logger.log`.

```bash
kubectl logs deploy/logger -n ckad-observe --tail=20 > /tmp/logger.log
kubectl create configmap logger-snapshot -n ckad-observe \
  --from-file=logger.log=/tmp/logger.log \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl get configmap logger-snapshot -n ckad-observe -o yaml
```

La verification controle que le log stocke contient `health=ok`.
