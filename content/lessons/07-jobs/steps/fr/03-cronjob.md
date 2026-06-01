## Planifier avec un CronJob

Un CronJob exécute un Job selon un minuteur. Créez-en un nommé **`report`** qui se déclenche toutes les minutes :

```bash
kubectl create cronjob report \
  --image=busybox:1.36 \
  --schedule="*/1 * * * *" \
  -- /bin/sh -c "date; echo nightly report done"
```

Examinez-le :

```bash
kubectl get cronjob report
# NAME     SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
# report   */1 * * * *   False     0        <none>          5s
```

Attendre une minute entière pour le déclenchement est lent. Vous pouvez **lancer une exécution immédiate** en créant un Job *depuis* le modèle du CronJob — c'est exactement ce que fait un ingénieur d'astreinte pour tester une tâche planifiée :

```bash
kubectl create job report-now --from=cronjob/report
kubectl wait --for=condition=complete job/report-now --timeout=60s
kubectl logs -l job-name=report-now
```

Au bout d'une ou deux minutes, le planning lui-même commencera à créer des Jobs nommés `report-<timestamp>`. Listez-les :

```bash
kubectl get jobs
```

> **Note :** un CronJob ne conserve que les derniers Jobs terminés
> (`successfulJobsHistoryLimit`, valeur par défaut 3) afin que l'historique ne s'accumule pas indéfiniment.

Lorsque le CronJob **`report`** existe et que votre Job **`report-now`** est terminé, cliquez **Vérifier**. ✅
