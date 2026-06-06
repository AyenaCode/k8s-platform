## Schedule work with a CronJob

A CronJob fires a new Job on a timer. It holds a `jobTemplate` — the blueprint
every triggered Job is stamped from. You never touch the schedule to test it;
you trigger a manual run instead.

### Your task

**1. Create the CronJob** named `report`, firing every minute:

```bash
kubectl create cronjob report \
  --image=busybox:1.36 \
  --schedule="*/1 * * * *" \
  -- /bin/sh -c "date; echo nightly report done"
```

**2. Confirm it registered:**

```bash
kubectl get cronjob report
```

What good looks like:

```text
NAME     SCHEDULE      SUSPEND   ACTIVE   LAST SCHEDULE   AGE
report   */1 * * * *   False     0        <none>          5s
```

**3. Trigger a manual run now** — don't wait for the schedule. This is exactly
what an on-call engineer does to test a scheduled task:

```bash
kubectl create job report-now --from=cronjob/report
```

**4. Wait for it to complete and check the output:**

```bash
kubectl wait --for=condition=complete job/report-now --timeout=60s
kubectl logs -l job-name=report-now
```

**5. After a minute or two, list all Jobs** — the scheduler will have fired its
own run named `report-<timestamp>`:

```bash
kubectl get jobs
```

> [!NOTE]
> A CronJob keeps only the last few finished Jobs by default
> (`successfulJobsHistoryLimit` defaults to **3**). History never piles up
> unboundedly.

> [!TIP]
> `kubectl create job <name> --from=cronjob/<name>` is the standard way to
> trigger a one-off run from any CronJob template — no YAML editing needed.

When CronJob **`report`** exists and Job **`report-now`** has completed, then hit **Verify**. ✅
