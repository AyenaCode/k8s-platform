## Launch your first Pod

Time to put a real workload on the cluster. No copy-paste here: **you find the
command.** That's the whole point. On a real job nobody hands you the line, so
you train that reflex now.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Kind  | Pod |
| Name  | `web` |
| Image | `nginx` |
| State | `Running` (READY `1/1`) |

### 🔍 How to find it yourself

You want to *run* something. Which `kubectl` verb is that? Ask the tool:

```bash
kubectl run --help        # read the SYNOPSIS line and the first example
```

The help shows you the shape: a name, then `--image=`. Build your own line from
that. Then watch it come up until `Running`:

```bash
kubectl get pods -w        # live updates, Ctrl-C to stop
```

> [!TIP]
> **Stuck on `ContainerCreating`?** The image is downloading (first pull). Wait a
> few seconds and watch again. That's normal, not an error.

📖 Docs: [kubectl run](https://kubernetes.io/docs/reference/kubectl/quick-reference/) · [Pods](https://kubernetes.io/docs/concepts/workloads/pods/)

When `web` is **Running**, hit **Verify**. ✅
