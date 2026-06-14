## Inject ConfigMaps and Secrets

ConfigMaps carry non-sensitive config. Secrets carry sensitive values, but still
need normal Kubernetes access control. The skill is wiring them into the Pod.

### Your task

In namespace **`ckad-sec`**:

- ConfigMap `app-settings` with `MODE=prod`
- Secret `db-secret` with `PASSWORD=ckad-pass`
- Pod `secure-app`, image `busybox:1.36`, command `sleep 3600`
- the Pod must receive both resources through `envFrom`

Commands:

```bash
kubectl create namespace ckad-sec
kubectl create configmap app-settings -n ckad-sec --from-literal=MODE=prod
kubectl create secret generic db-secret -n ckad-sec --from-literal=PASSWORD=ckad-pass
```

Then create the Pod YAML with:

```yaml
envFrom:
- configMapRef:
    name: app-settings
- secretRef:
    name: db-secret
```

Verify after `kubectl exec secure-app -n ckad-sec -- printenv MODE PASSWORD`
prints the expected values.
