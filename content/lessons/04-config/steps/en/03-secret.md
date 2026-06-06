## Create a Secret and mount it as a file

Secrets share the same structure as ConfigMaps, but the kubelet only delivers them to nodes that actually run a Pod using them, and access is controlled separately via RBAC. You will create **`app-secret`**, then mount it as a directory of files inside a Pod: each key becomes a file whose content is the value.

> [!WARNING]
> A Secret is **base64-encoded, not encrypted** at rest by default. Anyone with `kubectl get secret` access can decode the value in seconds. Treat RBAC on Secrets as mandatory, not optional.

### Your task

**1. Create the Secret:**

```bash
kubectl create secret generic app-secret --from-literal=API_KEY=s3cr3t
```

**2. Run a Pod that mounts the Secret as a volume** at `/etc/secret`:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: secret-demo
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    volumeMounts:
    - name: secret-vol
      mountPath: /etc/secret
      readOnly: true
  volumes:
  - name: secret-vol
    secret:
      secretName: app-secret
EOF
```

**3. Wait for Running, then read the mounted file:**

```bash
kubectl get pod secret-demo -w       # wait for Running, then Ctrl-C
kubectl exec secret-demo -- cat /etc/secret/API_KEY
```

What good looks like:

```text
s3cr3t
```

The key `API_KEY` became the filename; its value is the file content.

> [!TIP]
> Volume-mounted Secrets (and ConfigMaps) **eventually update** when you change the object, the kubelet re-syncs within seconds to a minute. Env vars are **frozen** at container start and require a Pod restart. Exception: a `subPath` mount does **not** auto-update, even as a volume.

Then hit **Verify**. ✅
