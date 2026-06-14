## Capture logs as evidence

The setup creates a Deployment named **`logger`** that writes a repeated
`health=ok` line. In exam-style work, logs are often the fastest way to prove the
symptom.

### Your task

Click **Prepare**, then capture the latest logs and store them in ConfigMap
**`logger-snapshot`** in namespace **`ckad-observe`** under key `logger.log`.

```bash
kubectl logs deploy/logger -n ckad-observe --tail=20 > /tmp/logger.log
kubectl create configmap logger-snapshot -n ckad-observe \
  --from-file=logger.log=/tmp/logger.log \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl get configmap logger-snapshot -n ckad-observe -o yaml
```

Verify will check that the stored log contains `health=ok`.
