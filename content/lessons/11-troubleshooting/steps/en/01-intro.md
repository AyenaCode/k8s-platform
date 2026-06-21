## Master the debugging loop

Think of yourself as a detective at a crime scene. You do not touch anything until you have read all the clues. In Kubernetes, the clues are always in three places.

```bash
kubectl get pods                      # 1. Spot the STATUS (the headline symptom)
kubectl describe pod <name>           # 2. Read the Events section at the bottom
kubectl logs <name>                   # 3. Hear what the app said (add --previous after a crash)
```

The **STATUS** column tells you which category of problem you are facing before you open a single log line:

| STATUS | What it signals |
|--------|-----------------|
| `ImagePullBackOff` / `ErrImagePull` | Something is wrong with the image reference |
| `CrashLoopBackOff` | The container starts but exits right away |
| `OOMKilled` | The container exceeded its memory limit |
| `CreateContainerConfigError` | A ConfigMap or Secret key it needs does not exist |
| `Pending` | No node accepted the Pod yet |
| `Running` but `0/1` Ready | The container is up, but something is still not right |

> [!IMPORTANT]
> `get` shows the symptom. `describe` shows the clues (scroll to **Events**). `logs` shows the app's own voice. Always run them in that order. Do not skip steps.

The platform will break three workloads on purpose. For each one: click **Prepare task**, read the clues, figure out what is wrong, fix it, then click **Verify**.
