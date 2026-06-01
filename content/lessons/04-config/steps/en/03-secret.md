## Mount a Secret as a file

Secrets work like ConfigMaps but hold sensitive data. Create one:

```bash
kubectl create secret generic app-secret --from-literal=API_KEY=s3cr3t
```

This time, instead of env vars, **mount** the Secret as files. Each key becomes a
file whose content is the value. Paste this block:

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

Once it is Running, read the mounted file:

```bash
kubectl get pod secret-demo -w       # wait for Running, then Ctrl-C
kubectl exec secret-demo -- cat /etc/secret/API_KEY
```

You should see `s3cr3t`. The key `API_KEY` became a file at
`/etc/secret/API_KEY`.

> **Why mount instead of env?** Mounted secrets **auto-update** when you change
> the Secret (env vars do not — they are frozen at container start). Files also
> keep secrets out of `kubectl describe` and process listings.

When `secret-demo` is **Running** and the file shows `s3cr3t`, click **Verify**. ✅
