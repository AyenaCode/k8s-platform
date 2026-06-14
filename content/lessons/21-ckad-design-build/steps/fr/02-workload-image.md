## Choisir le workload et l'image

L'application doit lancer une commande d'audit toutes les cinq minutes. Un `Pod`
n'est pas le bon choix car il s'execute une fois. Un `Deployment` n'est pas bon
non plus car il maintient un processus en vie. Utilise un `CronJob`.

### Ta tache

Dans le namespace **`ckad-design`**, cree un CronJob nomme **`image-audit`** :

- schedule : `*/5 * * * *`
- image : `busybox:1.36`
- restart policy : `OnFailure`
- la commande affiche la date et le texte `image-audit`
- conserve `2` Jobs reussis dans l'historique

Depart rapide :

```bash
kubectl create namespace ckad-design
kubectl create cronjob image-audit -n ckad-design \
  --image=busybox:1.36 \
  --schedule='*/5 * * * *' \
  -- /bin/sh -c 'date; echo image-audit'
kubectl patch cronjob image-audit -n ckad-design --type=merge \
  -p '{"spec":{"successfulJobsHistoryLimit":2}}'
kubectl get cronjob image-audit -n ckad-design -o yaml
```

Clique sur **Verifier** quand la spec correspond a la demande.
