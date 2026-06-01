## A Service for the backend

An Ingress routes to a **Service**, never straight to Pods. So first we need a
Service. The platform has pre-created a Deployment named **`site`** (nginx) for
you — click **Prepare task** if you have not already.

Confirm it is there:

```bash
kubectl get deploy site
```

Now expose it with a ClusterIP Service named **`site-svc`** on port 80:

```bash
kubectl expose deployment site --name=site-svc --port=80
```

Check that the Service found its Pods (it must have **endpoints**, or the Ingress
will route to nothing):

```bash
kubectl get svc site-svc
kubectl get endpoints site-svc
# site-svc   10.42.x.y:80    ...   (an endpoint = a ready Pod behind the Service)
```

A ClusterIP Service is reachable **only inside** the cluster — perfect as an
Ingress backend. The Ingress (next step) becomes the public door in front of it.

When `site-svc` exists on **port 80 with at least one endpoint**, click
**Verify**. ✅
