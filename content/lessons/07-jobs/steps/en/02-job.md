## Run a Job to completion

Create a Job named **`hello`** that prints a line and exits:

```bash
kubectl create job hello --image=busybox:1.36 -- /bin/sh -c "echo hello from a job; sleep 2"
```

A Job creates a Pod, runs it, and tracks whether it **succeeded**. Watch it move
from running to completed:

```bash
kubectl get pods -l job-name=hello -w     # Running -> Completed, then Ctrl-C
```

You can **block** until the Job is done — handy in scripts and pipelines:

```bash
kubectl wait --for=condition=complete job/hello --timeout=60s
```

Check the result. A Job records how many Pods succeeded:

```bash
kubectl get job hello
# NAME    COMPLETIONS   DURATION   AGE
# hello   1/1           4s         20s

kubectl logs -l job-name=hello       # see "hello from a job"
```

Notice the completed Pod **sticks around** so you can read its logs — it is not
cleaned up automatically (unless you set `ttlSecondsAfterFinished`).

When `hello` shows **`1/1` COMPLETIONS**, click **Verify**. ✅
