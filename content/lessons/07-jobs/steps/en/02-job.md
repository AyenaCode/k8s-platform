## Run a Job to completion

A Job is like giving Kubernetes one chore: "run this container until it exits cleanly, then stop." No auto-restart forever. Just: done or not done.

Your goal is to create a Job, watch its Pod finish, and read the output it left behind.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Kind | Job |
| Name | `hello` |
| Image | `busybox:1.36` |
| Command | prints something, then exits cleanly (exit 0) |
| State | Job shows `1/1` COMPLETIONS |

### 🔍 How to find it yourself

Start with the built-in help to see the shape of the command:

```bash
kubectl create job --help
```

Read the synopsis line and the examples. Notice how a command is passed after `--`.

Once the Job exists, track its Pod and read the output:

```bash
kubectl get jobs,pods
kubectl logs job/hello
```

Want to understand which spec fields control retries and parallelism? Ask the API:

```bash
kubectl explain job.spec.backoffLimit
kubectl explain job.spec.completions
```

> [!TIP]
> Not sure the Pod finished? `kubectl get pods -l job-name=hello` shows you the STATUS column. `Completed` means exit 0.

📖 Docs: [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `hello` shows **`1/1` COMPLETIONS**, hit **Verify**. ✅
