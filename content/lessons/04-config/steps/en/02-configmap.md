## Inject config as env vars

First, create a ConfigMap named **`app-config`** with two keys:

```bash
kubectl create configmap app-config \
  --from-literal=LOG_LEVEL=debug \
  --from-literal=GREETING=hello
```

Look at what you made:

```bash
kubectl get configmap app-config -o yaml
```

Now run a Pod that loads **every** key of the ConfigMap as environment variables,
using `envFrom`. Paste this whole block:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: cm-demo
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    envFrom:
    - configMapRef:
        name: app-config
EOF
```

Wait for it to run, then read the env var from **inside** the container:

```bash
kubectl get pod cm-demo -w          # wait for Running, then Ctrl-C
kubectl exec cm-demo -- printenv LOG_LEVEL GREETING
```

You should see `debug` and `hello`. The Pod never knew these values — the cluster
injected them from the ConfigMap.

When `cm-demo` is **Running** and prints the env vars, click **Verify**. ✅
