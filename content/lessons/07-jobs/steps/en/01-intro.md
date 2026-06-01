## Run-to-completion workloads

Deployments are for things that should run **forever** — web servers, APIs. But a
lot of real work is the opposite: do a task **once**, then stop. A database
migration, a backup, a nightly report, a batch import.

For that, Kubernetes has two objects:

- **Job** — runs one or more Pods until they **succeed** (exit 0), then stops.
  If a Pod fails, the Job retries it (up to `backoffLimit`).
- **CronJob** — creates a Job on a **schedule**, using standard cron syntax.

The key difference from a Deployment is the Pod's `restartPolicy`. A Job's Pod
must use `Never` or `OnFailure` — **not** `Always` (the default), because a task
that "always restarts" never finishes.

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

> **Key idea:** a Job tracks *success*, not *uptime*. It is done when the task
> completes — and a CronJob is just a Job factory on a timer.

In this lesson you will run a Job to completion, then wrap it in a CronJob and
trigger a run on demand. →
