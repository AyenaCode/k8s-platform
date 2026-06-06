## Expose the backend with a Service

An Ingress routes to a **Service**, never straight to Pods. Before you can create an Ingress, you need a Service in place.

The platform has pre-seeded a Deployment named **`site`** (nginx) — click **Prepare task** if you have not already done so.

### Your task

**1. Confirm the Deployment is ready.**

```bash
kubectl get deploy site
```

**2. Expose it as a ClusterIP Service named `site-svc` on port 80.**

```bash
kubectl expose deployment site --name=site-svc --port=80
```

**3. Verify the Service has endpoints** (at least one ready Pod behind it).

```bash
kubectl get endpoints site-svc
```

What good looks like:

```text
NAME       ENDPOINTS         AGE
site-svc   10.42.x.y:80      5s
```

An endpoint is a ready Pod the Service can forward to. If this column shows `<none>`, the selector matched no running Pod — wait a few seconds and retry.

> [!NOTE]
> A ClusterIP Service is reachable **only inside** the cluster, which is exactly what you want for an Ingress backend. The Ingress (next step) becomes the public front door.

> [!WARNING]
> If you already ran `kubectl expose` and see `Error: service "site-svc" already exists`, the Service is there — skip step 2 and continue to step 3.

When `site-svc` exists on port 80 with at least one endpoint, then hit **Verify**. ✅
