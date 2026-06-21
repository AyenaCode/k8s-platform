## Schedule it with a CronJob

A CronJob is a timer. Every time it fires, it stamps out a new Job using a `jobTemplate`. The CronJob itself never runs a container; it just creates Jobs on schedule.

On a real team, you do not wait for the scheduler to test a CronJob. You trigger a manual run immediately. That reflex is what this step trains.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Kind | CronJob |
| Name | `report` |
| Image | `busybox:1.36` |
| Schedule | every minute (`*/1 * * * *`) |
| Manual run | a Job named `report-now`, created from the CronJob template, that reaches `1/1` COMPLETIONS |

### 🔍 How to find it yourself

The `create cronjob` command has its own help page:

```bash
kubectl create cronjob --help
```

Look for the `--schedule` and `--image` flags. The schedule uses standard cron syntax from the intro step.

Once the CronJob exists, check it registered correctly:

```bash
kubectl get cronjob report
```

To trigger a manual run without touching the schedule, look at this flag:

```bash
kubectl create job --help    # search for the --from flag
```

After triggering the manual run, watch it finish and read its logs:

```bash
kubectl get jobs,pods
kubectl logs job/report-now
```

> [!TIP]
> The `--from=cronjob/<name>` flag is how on-call engineers test a scheduled task in production without editing YAML or waiting for midnight.

📖 Docs: [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When CronJob **`report`** exists and Job **`report-now`** has **`1/1` COMPLETIONS**, hit **Verify**. ✅
