## Inspect, logs & exec — your debugging toolkit

These four commands are the ones you'll type every single day. Try each against
your `web` Pod:

**1. Describe** — config + recent **Events** (your goldmine when something breaks):

```bash
kubectl describe pod web
```

**2. Logs** — what the container printed to stdout/stderr:

```bash
kubectl logs web
```

**3. Exec** — get a shell *inside* the container:

```bash
kubectl exec -it web -- bash
# you are now inside nginx; try:  ls /usr/share/nginx/html  then  exit
```

**4. YAML** — see the full object as the cluster stores it:

```bash
kubectl get pod web -o yaml | less
```

### Your task

To complete this step, **label** your Pod so the platform can confirm you got
here:

```bash
kubectl label pod web seen=true
```

Then click **Verify**. ✅
