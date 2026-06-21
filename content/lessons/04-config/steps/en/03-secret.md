## Create a Secret and mount it as a file

A Secret is the same structure as a ConfigMap, but locked in a drawer: the kubelet only delivers it to nodes that actually run a consuming Pod, and RBAC controls who can read it. You will create **`app-secret`**, then mount it as a directory of files inside a Pod. Each key becomes a filename; its value becomes the file content.

> [!WARNING]
> A Secret is **base64-encoded, not encrypted** at rest by default. Anyone with `kubectl get secret` access can decode the value instantly. RBAC on Secrets is mandatory, not optional.

### 🎯 Mission

| What | Value |
|------|-------|
| Secret name | `app-secret` |
| Key | `API_KEY=s3cr3t` |
| Pod name | `secret-demo` |
| Pod image | `busybox:1.36` |
| Mount path | `/etc/secret` |
| Proof | `cat /etc/secret/API_KEY` inside `secret-demo` prints `s3cr3t` |

### 🔍 How to find it yourself

Start with the create command:

```bash
kubectl create secret generic --help
```

Read the `--from-literal` flag. Build your own line.

For the Pod spec, you need a volume backed by a Secret and a volumeMount. Explore:

```bash
kubectl explain pod.spec.volumes.secret
kubectl explain pod.spec.containers.volumeMounts
```

Use `--dry-run=client -o yaml` to preview your Secret without creating it yet:

```bash
kubectl create secret generic demo --from-literal=KEY=val --dry-run=client -o yaml
```

Once both exist, inspect:

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}'
kubectl exec secret-demo -- ls /etc/secret
kubectl exec secret-demo -- cat /etc/secret/API_KEY
```

> [!TIP]
> Volume-mounted Secrets eventually update when you edit the object (kubelet re-syncs within seconds to a minute). Env vars are frozen at container start and need a Pod restart. A `subPath` mount is the exception: it never auto-updates.

📖 Docs: [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `secret-demo` is Running and `cat /etc/secret/API_KEY` returns `s3cr3t`, hit **Verify**. ✅
