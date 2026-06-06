## Comprendre les charges à exécution unique

Les Deployments font tourner des processus **indéfiniment** — serveurs web, APIs.
Mais une grande partie du travail réel est à l'opposé : effectuer une tâche
**une seule fois**, puis s'arrêter. Une migration de base de données, une
sauvegarde, un rapport nocturne, une importation par lots.

Kubernetes propose deux objets pour cela :

- **Job** — exécute un ou plusieurs Pods jusqu'à ce qu'ils **réussissent**
  (code de sortie 0), puis s'arrête. En cas d'échec, le Job relance le Pod
  (jusqu'à `backoffLimit`).
- **CronJob** — crée un Job selon un **calendrier**, en syntaxe cron à cinq
  champs. Il possède un `jobTemplate` qui définit chaque Job déclenché.

La différence essentielle avec un Deployment : un Pod de Job doit utiliser
`restartPolicy: Never` ou `OnFailure` — **jamais** `Always`. Une tâche qui
« redémarre toujours » ne se termine jamais.

> [!NOTE]
> Un Job suit le *succès*, pas le *temps de fonctionnement*. Il est terminé
> quand le nombre requis de Pods sort avec le code 0 (`completions`, défaut 1).
> Un CronJob n'est qu'une fabrique de Jobs sur minuteur — il n'exécute rien
> lui-même.

### La syntaxe cron en un coup d'œil

```text
┬ ┬ ┬ ┬ ┬
│ │ │ │ └ jour semaine (0-6, dim=0)
│ │ │ └── mois        (1-12)
│ │ └──── jour mois   (1-31)
│ └────── heure       (0-23)
└──────── minute      (0-59)

*/1 * * * *   toutes les minutes
0 2 * * *     tous les jours à 02h00
0 0 * * 0     dimanches à 00h00
```

Dans cette leçon, vous exécuterez un Job jusqu'à sa complétion, puis vous
l'encapsulerez dans un CronJob et déclencherez une exécution à la demande.

**Continuer →**
