## Run a Job to completion

A Job creates Pods, runs them, and tracks whether they **succeeded**. When the
required number exits 0 the Job is marked complete, and the Pods stick around
so you can read their logs.

### Your task

**1. Create the Job** named `hello`:

```bash
kubectl create job hello --image=busybox:1.36 -- /bin/sh -c "echo hello from a job; sleep 2"
```

**2. Watch the Pod move from `Running` to `Completed`:**

```bash
kubectl get pods -l job-name=hello -w     # Ctrl-C when Completed
```

What good looks like:

```text
NAME          READY   STATUS      RESTARTS   AGE
hello-xxxxx   0/1     Completed   0          8s
```

**3. Block until the Job is done**, handy in scripts and pipelines:

```bash
kubectl wait --for=condition=complete job/hello --timeout=60s
```

**4. Confirm the result:**

```bash
kubectl get job hello
```

What good looks like:

```text
NAME    COMPLETIONS   DURATION   AGE
hello   1/1           4s         20s
```

**5. Read the output:**

```bash
kubectl logs -l job-name=hello
```

> [!TIP]
> The completed Pod **stays around** so you can inspect logs after the fact.
> Set `ttlSecondsAfterFinished` on the Job spec if you want automatic cleanup.

> [!NOTE]
> Key Job spec fields: `completions` (how many Pods must succeed, default 1),
> `parallelism` (how many run at once, default 1), `backoffLimit` (max retries
> before the Job is marked failed, default 6).

When `hello` shows **`1/1` COMPLETIONS**, then hit **Verify**. ✅
