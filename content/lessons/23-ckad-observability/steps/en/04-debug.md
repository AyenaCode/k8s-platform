## Fix a crashing container

Click **Prepare**. A Deployment named **`bad-command`** will start crashing. Your
job is to diagnose from cluster state and fix the command.

### Your task

Use:

```bash
kubectl get pods -n ckad-observe
kubectl describe pod -n ckad-observe -l app=bad-command
kubectl logs -n ckad-observe -l app=bad-command --previous
```

Then patch the Deployment so the container stays alive. For example:

```bash
kubectl patch deployment bad-command -n ckad-observe --type=json \
  -p='[{"op":"replace","path":"/spec/template/spec/containers/0/command","value":["/bin/sh","-c","sleep 3600"]}]'
kubectl rollout status deployment/bad-command -n ckad-observe
```

Verify when the Deployment has an available replica.
