## Stop baking config into images

A good container image is **identical across every environment**: dev, staging, prod. What changes is *configuration*: a log level, a database URL, an API key. Bake those into the image and you need a rebuild for every environment change. That is the wrong approach.

Think of it this way:

- **ConfigMap**: a sticky note of settings left on the fridge. Anyone can read it.
- **Secret**: the same sticky note, but locked in a drawer. Access is controlled.

Both inject into a Pod two ways:

| Injection method | What it looks like inside the container |
|---|---|
| **Environment variables** | `printenv LOG_LEVEL` |
| **Volume-mounted files** | `cat /etc/config/log_level` |

> [!NOTE]
> The image stays generic. The cluster injects the right config at run time.
> Update the ConfigMap or Secret, restart the Pod: done. No rebuild, no new tag.

### Recon

Your terminal is wired to a live k3s cluster. Orient yourself:

```bash
kubectl get nodes
kubectl get configmaps
kubectl get secrets
```

In this lesson you will create a ConfigMap, inject it into a Pod as env vars, then create a Secret and mount it as a file.

📖 Docs: [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) · [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

**Continue →**
