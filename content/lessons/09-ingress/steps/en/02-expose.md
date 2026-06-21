## Expose the backend with a Service

An Ingress routes to a **Service**, never straight to Pods. Think of the Service as the internal hallway: the Ingress sends visitors to the right hallway, then the hallway distributes them to the rooms (Pods).

The platform has pre-seeded a Deployment named **`site`** (nginx). Click **Prepare task** if you have not done so yet.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Kind | Service (ClusterIP) |
| Name | `site-svc` |
| Targets | Deployment `site` |
| Port | `80` |
| At least one endpoint | yes |

### 🔍 How to find it yourself

First, check what is already there:

```bash
kubectl get deploy site
kubectl get svc,endpoints
```

You need to expose the Deployment. Which `kubectl` verb creates a Service from a Deployment? Ask:

```bash
kubectl expose --help
```

Read the SYNOPSIS and examples. You want to expose a **deployment**, name the Service `site-svc`, and bind it on port `80`. Build your own command from what you read.

After you create the Service, verify it has live endpoints:

```bash
kubectl get endpoints site-svc
```

The `ENDPOINTS` column should show an IP, not `<none>`. If it shows `<none>`, wait a few seconds for the Pod to become Ready and try again.

> [!NOTE]
> A ClusterIP Service is reachable only inside the cluster. That is exactly what you want: the Ingress (next step) becomes the public face, and it talks to the Service internally.

📖 Docs: [Service](https://kubernetes.io/docs/concepts/services-networking/service/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `site-svc` exists on port 80 with at least one endpoint, hit **Verify**. ✅
