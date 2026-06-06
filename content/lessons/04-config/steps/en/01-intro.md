## Stop baking config into images

A good container image is **identical across every environment**: dev, staging, prod. What changes is *configuration*: a log level, a database URL, an API key. Bake those into the image and you need a rebuild for every environment change. That is the wrong approach.

Kubernetes gives you two `core/v1` objects to keep config **outside** the image:

- **ConfigMap**: non-sensitive settings (log level, feature flags, service URLs).
- **Secret**: sensitive values (passwords, tokens, keys). Same structure, but gated by RBAC and handled separately by the kubelet.

Both inject into a Pod in two ways:

| Injection method | What it looks like inside the container |
|---|---|
| **Environment variables** | `printenv LOG_LEVEL` |
| **Volume-mounted files** | `cat /etc/config/log_level` |

> [!NOTE]
> The image stays generic; the cluster injects the right config at run time.
> Update the ConfigMap or Secret, restart the Pod: done. No rebuild, no new tag.

### Recon

Your terminal is wired to a live k3s cluster. Orient yourself:

```bash
kubectl get nodes
kubectl get configmaps         # likely just "kube-root-ca.crt" from the system
kubectl get secrets
```

In this lesson you will create a ConfigMap, inject it into a Pod as env vars, then create a Secret and mount it as a file. **Continue →**
