## Charges de travail à exécution unique

Les Deployments sont conçus pour les processus qui doivent tourner **indéfiniment** — serveurs web, APIs. Mais une grande partie du travail réel est à l'opposé : effectuer une tâche **une seule fois**, puis s'arrêter. Une migration de base de données, une sauvegarde, un rapport nocturne, une importation par lots.

Pour cela, Kubernetes dispose de deux objets :

- **Job** — exécute un ou plusieurs Pods jusqu'à ce qu'ils **réussissent** (sortie 0), puis s'arrête.
  Si un Pod échoue, le Job le relance (jusqu'à `backoffLimit`).
- **CronJob** — crée un Job selon un **calendrier**, en utilisant la syntaxe cron standard.

La différence essentielle avec un Deployment réside dans la `restartPolicy` du Pod. Un Pod de Job doit utiliser `Never` ou `OnFailure` — **pas** `Always` (la valeur par défaut), car une tâche qui « redémarre toujours » ne se termine jamais.

```
*/1 * * * *      cron: "at every 1st minute" (every minute)
0 2 * * *        "at 02:00 every day"
0 0 * * 0        "at midnight every Sunday"
┬ ┬ ┬ ┬ ┬
│ │ │ │ └ day of week (0-6)
│ │ │ └── month (1-12)
│ │ └──── day of month (1-31)
│ └────── hour (0-23)
└──────── minute (0-59)
```

> **Idée clé :** un Job suit le *succès*, pas le *temps de fonctionnement*. Il est terminé lorsque la tâche est accomplie — et un CronJob n'est qu'une fabrique de Jobs déclenchée par un minuteur.

Dans cette leçon, vous exécuterez un Job jusqu'à sa complétion, puis vous l'encapsulez dans un CronJob et déclencherez une exécution à la demande. →
