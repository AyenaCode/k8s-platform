## Create a ConfigMap and inject it as env vars

A ConfigMap stores key/value pairs outside your image. Think of it as a sticky note of settings the cluster hands to your container at startup. You will create **`app-config`** with two keys, then run a Pod that loads every key as an environment variable.

### 🎯 Mission

| What | Value |
|------|-------|
| ConfigMap name | `app-config` |
| Key 1 | `LOG_LEVEL=debug` |
| Key 2 | `GREETING=hello` |
| Pod name | `cm-demo` |
| Pod image | `busybox:1.36` |
| Injection method | all keys as env vars (`envFrom`) |
| Proof | `printenv LOG_LEVEL` inside `cm-demo` prints `debug` |

### 🔍 How to find it yourself

Start with the tool's own help. You want to create a configmap from literal values:

```bash
kubectl create configmap --help
```

Read the `--from-literal` flag and the examples. Build your own command from that.

Then you need a Pod spec that uses `envFrom`. Ask the resource schema:

```bash
kubectl explain pod.spec.containers.envFrom
kubectl explain pod.spec.containers.envFrom.configMapRef
```

Use `--dry-run=client -o yaml` to preview your ConfigMap before committing it:

```bash
kubectl create configmap demo --from-literal=KEY=val --dry-run=client -o yaml
```

Once both exist, inspect what you made:

```bash
kubectl get cm,pod
kubectl get configmap app-config -o yaml
kubectl exec cm-demo -- printenv LOG_LEVEL
```

> [!TIP]
> `envFrom` bulk-loads every key. If you only need one key, `kubectl explain pod.spec.containers.env` shows the `valueFrom.configMapKeyRef` path instead.

📖 Docs: [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `cm-demo` is Running and `printenv LOG_LEVEL` returns `debug`, hit **Verify**. ✅
