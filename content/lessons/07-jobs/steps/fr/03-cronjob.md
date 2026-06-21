## Planifier avec un CronJob

Un CronJob, c'est un minuteur. A chaque declenchement, il fabrique un nouveau Job a partir d'un `jobTemplate`. Le CronJob lui-meme n'execute jamais de conteneur ; il cree juste des Jobs selon le planning.

Dans une vraie equipe, on n'attend pas le planificateur pour tester un CronJob. On declenche une execution manuelle immediatement. C'est ce reflexe que cette etape t'entraine a avoir.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Kind | CronJob |
| Nom | `report` |
| Image | `busybox:1.36` |
| Planning | toutes les minutes (`*/1 * * * *`) |
| Execution manuelle | un Job nomme `report-now`, cree depuis le template du CronJob, qui atteint `1/1` COMPLETIONS |

### 🔍 Comment la trouver toi-meme

La commande `create cronjob` a sa propre page d'aide :

```bash
kubectl create cronjob --help
```

Cherche les flags `--schedule` et `--image`. Le planning utilise la syntaxe cron standard vue dans l'introduction.

Une fois le CronJob cree, verifie qu'il est bien enregistre :

```bash
kubectl get cronjob report
```

Pour declencher une execution manuelle sans toucher au planning, regarde ce flag :

```bash
kubectl create job --help    # cherche le flag --from
```

Apres avoir declenche l'execution manuelle, surveille-la se terminer et lis ses logs :

```bash
kubectl get jobs,pods
kubectl logs job/report-now
```

> [!TIP]
> Le flag `--from=cronjob/<nom>` permet aux ingenieurs d'astreinte de tester une tache planifiee en production sans modifier de YAML ni attendre minuit.

📖 Docs : [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) · [Cheat sheet kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand le CronJob **`report`** existe et que le Job **`report-now`** affiche **`1/1` COMPLETIONS**, clique sur **Verifier**. ✅
