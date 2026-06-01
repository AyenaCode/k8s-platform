## The debugging method

When a Pod misbehaves, guessing is slow. Good operators follow the **same three
steps every time**, from the outside in:

```bash
kubectl get pods            # 1. What is the STATUS? (the headline symptom)
kubectl describe pod <name> # 2. Read the Events at the bottom (the WHY)
kubectl logs <name>         # 3. What did the app itself say? (--previous for a crashed one)
```

Most problems announce themselves in the **STATUS** column. Learn to read it:

| STATUS | Usually means |
|---|---|
| `ImagePullBackOff` / `ErrImagePull` | wrong image name or tag, or no registry access |
| `CrashLoopBackOff` | the container starts then exits — bad command, missing dep, failed config |
| `OOMKilled` | hit its memory limit (you saw this in the Resources lesson) |
| `CreateContainerConfigError` | references a ConfigMap/Secret or key that does not exist |
| `Pending` | cannot be scheduled — not enough CPU/memory, or no matching node |
| `Running` but `0/1` ready | a readiness probe is failing (or, for a Service, no endpoints) |

> **Key idea:** `get` gives the symptom, `describe` gives the cause (in Events),
> `logs` gives the app's own story. Always go in that order.

In this clinic the platform will **break three Pods on purpose**. For each, click
**Prepare task**, diagnose it with the three commands, then fix it and **Verify**.
→
