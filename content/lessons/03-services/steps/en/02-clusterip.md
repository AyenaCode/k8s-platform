## Expose a Deployment with ClusterIP

The setup script already deployed a 2-replica `web` app for you. Your job is to
put a stable address in front of it.

### Your task

**1. Click "Prepare task"** to confirm the `web` Deployment is ready.

**2. Create the ClusterIP Service.**

```bash
kubectl expose deployment web --port=80
```

This creates a Service named `web` with `selector: app=web` — the same label
`kubectl create deployment` puts on every Pod it manages.

**3. Inspect the Service and its endpoints.**

```bash
kubectl get svc web
kubectl get endpoints web
```

What good looks like:

```text
NAME   TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
web    ClusterIP   10.43.12.34   <none>        80/TCP    5s

NAME   ENDPOINTS                       AGE
web    10.42.0.7:80,10.42.0.8:80       5s
```

One endpoint entry per Ready Pod — two here because the Deployment has 2 replicas.

> [!IMPORTANT]
> Empty endpoints = traffic goes nowhere. If you see `<none>`, the selector
> matches no Ready Pod. Check with:
> `kubectl get pods -l app=web`

**4. Reach the Service via its ClusterIP.**

```bash
IP=$(kubectl get svc web -o jsonpath='{.spec.clusterIP}')
curl $IP
```

You get the nginx welcome page — routed through the virtual IP, not a Pod IP.

Then hit **Verify**. ✅
