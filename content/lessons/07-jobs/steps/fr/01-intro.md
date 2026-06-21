## Charges à exécution unique

Un Deployment, c'est comme une lumière qu'on laisse allumée en permanence : il redémarre tant que le cluster tourne. Un Job, c'est différent. Imagine une corvée : fais cette chose jusqu'au bout, puis arrête-toi.

Trois idées à retenir :

- Un **Job** exécute un ou plusieurs Pods jusqu'à ce qu'ils sortent avec le code 0, puis se marque terminé. Si un Pod plante, le Job le relance (jusqu'à `backoffLimit` fois).
- Un **CronJob** est juste un minuteur qui crée un nouveau Job selon un planning. Il n'exécute rien lui-même ; il fabrique des Jobs à partir d'un `jobTemplate`.
- La contrainte clé : un Pod de Job doit utiliser `restartPolicy: Never` ou `OnFailure`. Jamais `Always`. Une tâche qui redémarre toujours ne se termine jamais.

> [!NOTE]
> Un Job suit le *succès*, pas le *temps de fonctionnement*. Il est terminé quand le bon nombre de Pods sort avec le code 0 (`completions`, défaut 1).

### La syntaxe cron en un coup d'oeil

```text
.----------- minute (0-59)
|  .-------- heure  (0-23)
|  |  .----- jour du mois (1-31)
|  |  |  .-- mois (1-12)
|  |  |  |  . jour de la semaine (0-6, dim=0)
|  |  |  |  |
*  *  *  *  *

*/1 * * * *   toutes les minutes
0 2 * * *     tous les jours a 02:00
0 0 * * 0     tous les dimanches a 00:00
```

Explore l'API avant de passer a la suite :

```bash
kubectl explain job.spec --recursive
kubectl explain cronjob.spec.jobTemplate --recursive
```

📖 Docs : [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) · [Cheat sheet kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

**Continue vers la premiere mission.**
