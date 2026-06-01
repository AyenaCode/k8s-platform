## Expose with a ClusterIP

Click **Prepare task** first — it deploys a 2-replica `web` app for you to expose.

Now create a **ClusterIP** Service in front of it:

```bash
kubectl expose deployment web --port=80
```

Inspect it and — crucially — check its **endpoints** (the Pod IPs it routes to):

```bash
kubectl get svc web
kubectl get endpoints web
# web   10.42.0.7:80,10.42.0.8:80   ← one entry per Ready Pod
```

> **The #1 Service debugging skill:** if `endpoints` is *empty*, the Service's
> selector matches no Ready Pod — traffic goes nowhere. Always check endpoints.

Reach it from inside the cluster using its ClusterIP:

```bash
kubectl get svc web -o jsonpath='{.spec.clusterIP}'   # e.g. 10.43.12.34
curl <that-ip>                                         # nginx welcome page
```

When the `web` Service has **at least one endpoint**, click **Verify**. ✅
