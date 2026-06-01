## Schedule it with a CronJob

A CronJob runs a Job on a timer. Create one named **`report`** that fires every
minute:

```bash
kubectl create cronjob report \
  --image=busybox:1.36 \
  --schedule="*/1 * * * *" \
  -- /bin/sh -c "date; echo nightly report done"
```

Look at it:

```bash
kubectl get cronjob report
# NAME     SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
# report   */1 * * * *   False     0        <none>          5s
```

Waiting a full minute for the schedule is slow. You can **trigger a run now** by
creating a Job *from* the CronJob's template — exactly what an on-call engineer
does to test a scheduled task:

```bash
kubectl create job report-now --from=cronjob/report
kubectl wait --for=condition=complete job/report-now --timeout=60s
kubectl logs -l job-name=report-now
```

After a minute or two, the schedule itself will also start creating Jobs named
`report-<timestamp>`. List them:

```bash
kubectl get jobs
```

> **Note:** a CronJob keeps only the last few finished Jobs
> (`successfulJobsHistoryLimit`, default 3) so history does not pile up forever.

When the CronJob **`report`** exists and your **`report-now`** Job has completed,
click **Verify**. ✅
