## Inspect, logs & exec — the daily toolkit

When something misbehaves, these are the commands you reach for first. Run each
against your `web` Pod.

### Drills

**1. Describe** — full config plus recent **Events** (your first stop when a Pod
won't start):

```bash
kubectl describe pod web
```

**2. Logs** — whatever the container wrote to stdout/stderr:

```bash
kubectl logs web          # add -f to stream live, --previous after a crash
```

**3. Exec** — drop into a shell *inside* the container:

```bash
kubectl exec -it web -- bash
# you're inside nginx now:  ls /usr/share/nginx/html   then  exit
```

**4. Raw object** — the Pod exactly as the cluster stores it:

```bash
kubectl get pod web -o yaml | less
```

> [!TIP]
> `kubectl events --for pod/web` (add `--watch`) is the cleaner, modern way to
> read a Pod's events without scrolling through `describe`.

### Your task

Prove you worked the Pod: **label** it so the platform can confirm your run.

```bash
kubectl label pod web seen=true
```

Then hit **Verify**. ✅
