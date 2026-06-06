## Create a ConfigMap and inject it as env vars

A ConfigMap stores key/value pairs. The fastest way to create one is `--from-literal`. You will create **`app-config`**, then run a Pod that consumes every key as environment variables using `envFrom`.

### Your task

**1. Create the ConfigMap** with two keys:

```bash
kubectl create configmap app-config \
  --from-literal=LOG_LEVEL=debug \
  --from-literal=GREETING=hello
```

**2. Inspect what you made**, see the data section:

```bash
kubectl get configmap app-config -o yaml
```

What good looks like:

```text
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  GREETING: hello
  LOG_LEVEL: debug
```

**3. Run a Pod that loads all keys as env vars** using `envFrom`:

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

**4. Wait for Running, then confirm the injection:**

```bash
kubectl get pod cm-demo -w          # wait for Running, then Ctrl-C
kubectl exec cm-demo -- printenv LOG_LEVEL GREETING
```

What good looks like:

```text
debug
hello
```

> [!TIP]
> `envFrom` bulk-loads every key. If you only need one key, use `env: valueFrom: configMapKeyRef` instead, it gives you full control over the variable name.

Then hit **Verify**. ✅
