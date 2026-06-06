## Understand run-to-completion workloads

Deployments keep things running **forever**: web servers, APIs. A lot of real
work is the opposite: do a task **once**, then stop. A database migration, a
backup, a nightly report, a batch import.

Kubernetes has two objects for that:

- **Job**: runs one or more Pods until they **succeed** (exit 0), then stops.
  If a Pod fails, the Job retries it (up to `backoffLimit`).
- **CronJob**: creates a Job on a **schedule**, using standard five-field cron
  syntax. It owns a `jobTemplate` that defines what each triggered Job looks like.

The critical difference from a Deployment: a Job Pod must use `restartPolicy:
Never` or `OnFailure`, **never** `Always`. A task that "always restarts" never
finishes.

> [!NOTE]
> A Job tracks *success*, not *uptime*. It is done when the required number of
> Pods exit 0 (`completions`, default 1). A CronJob is just a Job factory on a
> timer, it does not run anything itself.

### Cron syntax at a glance

```text
┬ ┬ ┬ ┬ ┬
│ │ │ │ └ dow   (0-6, Sun=0)
│ │ │ └── month (1-12)
│ │ └──── dom   (1-31)
│ └────── hour  (0-23)
└──────── minute (0-59)

*/1 * * * *   every minute
0 2 * * *     daily at 02:00
0 0 * * 0     Sundays at 00:00
```

In this lesson you will run a Job to completion, then wrap it in a CronJob and
trigger a manual run on demand.

**Continue →**
