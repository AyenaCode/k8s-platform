## Expose a Deployment with ClusterIP

The setup script already created a 2-replica `web` Deployment. Your job is to put a stable address in front of it. No command given here: you look it up and build it yourself.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Resource to create | Service |
| Name | `web` |
| Type | `ClusterIP` (default) |
| Port exposed | `80` |
| Selector target | the `web` Deployment |
| Proof | at least one endpoint IP listed under `kubectl get endpoints web` |

### 🔍 How to find it yourself

You want to *expose* something. Ask the tool:

```bash
kubectl expose --help        # read the SYNOPSIS and first examples
kubectl explain service.spec # understand what the fields do
```

After creating the Service, inspect what was made:

```bash
kubectl get svc web
kubectl get endpoints web
```

One endpoint entry per Ready Pod. Two Pods means two IPs in the list.

> [!TIP]
> Empty endpoints means the selector matches no Ready Pod. Run `kubectl get pods -l app=web` to check labels.

📖 Docs: [Service](https://kubernetes.io/docs/concepts/services-networking/service/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `kubectl get endpoints web` shows at least one IP, hit **Verify**. ✅
