## Run-to-completion workloads

A Deployment is like a light you leave on forever: it keeps restarting as long as the cluster is alive. A Job is different. Think of it like a chore: do this one thing until it is done, then stop.

Three ideas to hold on to:

- A **Job** runs one or more Pods until they exit with code 0, then marks itself complete. If a Pod crashes, the Job retries it (up to `backoffLimit` times).
- A **CronJob** is just a timer that creates a fresh Job on a schedule. It never runs anything itself; it stamps out Jobs using a `jobTemplate`.
- The key constraint: a Job Pod must use `restartPolicy: Never` or `OnFailure`. Never `Always`. A task that always restarts never finishes.

> [!NOTE]
> A Job tracks *success*, not *uptime*. It is done when the right number of Pods exit 0 (`completions`, default 1).

### Cron syntax at a glance

```text
.----------- minute (0-59)
|  .-------- hour   (0-23)
|  |  .----- day of month (1-31)
|  |  |  .-- month (1-12)
|  |  |  |  . day of week (0-6, Sun=0)
|  |  |  |  |
*  *  *  *  *

*/1 * * * *   every minute
0 2 * * *     every day at 02:00
0 0 * * 0     every Sunday at 00:00
```

Explore the API before moving on:

```bash
kubectl explain job.spec --recursive
kubectl explain cronjob.spec.jobTemplate --recursive
```

📖 Docs: [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

**Continue to the first mission.**
