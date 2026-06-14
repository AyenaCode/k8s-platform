## Expose an app with Ingress

Click **Prepare**. It creates Deployment and Service **`ingress-web`**.

### Your task

Create Ingress **`ckad-web`** in namespace **`ckad-net`**:

- host: `ckad.localhost`
- path: `/`
- pathType: `Prefix`
- backend service: `ingress-web`
- backend service port: `80`

Example:

```bash
# The trailing '*' in the rule path is what makes pathType Prefix
# (without it, kubectl create ingress defaults to pathType Exact).
kubectl create ingress ckad-web -n ckad-net \
  --rule='ckad.localhost/*=ingress-web:80'
kubectl get ingress ckad-web -n ckad-net -o yaml
```

If you want to test through Traefik:

```bash
curl -H 'Host: ckad.localhost' http://localhost/
```

Then verify.
