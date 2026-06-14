## Choose the workload and image

The app needs a repeated audit command every five minutes. A `Pod` is the wrong
shape because it runs once. A `Deployment` is also wrong because it keeps a
process alive. Use a `CronJob`.

### Your task

In namespace **`ckad-design`**, create a CronJob named **`image-audit`**:

- schedule: `*/5 * * * *`
- image: `busybox:1.36`
- restart policy: `OnFailure`
- command prints the date and the text `image-audit`
- keep `2` successful jobs in history

Example fast start:

```bash
kubectl create namespace ckad-design
kubectl create cronjob image-audit -n ckad-design \
  --image=busybox:1.36 \
  --schedule='*/5 * * * *' \
  -- /bin/sh -c 'date; echo image-audit'
kubectl patch cronjob image-audit -n ckad-design --type=merge \
  -p '{"spec":{"successfulJobsHistoryLimit":2}}'
kubectl get cronjob image-audit -n ckad-design -o yaml
```

Hit **Verify** when the spec matches the task.
