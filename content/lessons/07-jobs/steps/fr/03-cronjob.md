## Planifier une tâche avec un CronJob

Un CronJob déclenche un nouveau Job sur minuteur. Il contient un `jobTemplate` :
le modèle dont chaque Job déclenché est calqué. Pas besoin d'attendre le
planning pour le tester : on lance une exécution manuelle.

### Ta tâche

**1. Crée le CronJob** nommé `report`, toutes les minutes :

```bash
kubectl create cronjob report \
  --image=busybox:1.36 \
  --schedule="*/1 * * * *" \
  -- /bin/sh -c "date; echo nightly report done"
```

**2. Confirme qu'il est enregistré :**

```bash
kubectl get cronjob report
```

Ce que « bon » donne :

```text
NAME     SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
report   */1 * * * *   False     0        <none>          5s
```

**3. Déclenche une exécution immédiate**, sans attendre le planning. C'est
exactement ce que fait un ingénieur d'astreinte pour tester une tâche planifiée :

```bash
kubectl create job report-now --from=cronjob/report
```

**4. Attends la fin et lis la sortie :**

```bash
kubectl wait --for=condition=complete job/report-now --timeout=60s
kubectl logs -l job-name=report-now
```

**5. Au bout d'une minute ou deux, liste tous les Jobs**, le planificateur
aura créé son propre Job nommé `report-<timestamp>` :

```bash
kubectl get jobs
```

> [!NOTE]
> Un CronJob ne conserve que les derniers Jobs terminés par défaut
> (`successfulJobsHistoryLimit` vaut **3**). L'historique ne s'accumule jamais
> indéfiniment.

> [!TIP]
> `kubectl create job <nom> --from=cronjob/<nom>` est la méthode standard pour
> déclencher une exécution ponctuelle depuis n'importe quel CronJob, sans
> modifier le moindre YAML.

Quand le CronJob **`report`** existe et que le Job **`report-now`** est terminé, puis clique sur **Vérifier**. ✅
