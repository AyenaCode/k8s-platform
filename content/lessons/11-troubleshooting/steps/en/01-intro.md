## Master the debugging loop

Every production incident starts with the same three moves — from the outside in.

```bash
kubectl get pods              # 1. Spot the STATUS (the headline symptom)
kubectl describe pod <name>   # 2. Read the Events section (the cause)
kubectl logs <name>           # 3. Hear what the app said (--previous after a crash)
```

The **STATUS** column tells you which category of problem you are facing before you read a single log line:

| STATUS | What it means |
|---|---|
| `ImagePullBackOff` / `ErrImagePull` | Bad image name, wrong tag, or missing registry credentials |
| `CrashLoopBackOff` | Container starts, exits immediately — bad command, missing dep, failed config |
| `OOMKilled` | Container hit its memory limit and was killed |
| `CreateContainerConfigError` | References a ConfigMap / Secret key that does not exist |
| `Pending` | Cannot be scheduled — no node has enough CPU/memory |
| `Running` but `0/1` ready | Readiness probe failing — or, for a Service, no endpoints |

> [!IMPORTANT]
> `get` surfaces the symptom. `describe` gives the cause (scroll to **Events** at the bottom). `logs` tells the app's own story. Always run them in that order — don't skip ahead.

This is the capstone. The platform will **break three workloads on purpose**. For each one:
click **Prepare task** → diagnose with the three commands → fix it → click **Verify**.

**Continue →**
