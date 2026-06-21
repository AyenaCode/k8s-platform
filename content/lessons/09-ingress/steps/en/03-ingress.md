## Route HTTP traffic with an Ingress

Time to create the front door. The Ingress tells the receptionist (Traefik): whenever a guest asks for `site.local`, send them to the `site-svc` Service on port 80.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Kind | Ingress |
| Name | `site` |
| `ingressClassName` | `traefik` |
| Host rule | `site.local` |
| Path | `/` (Prefix) |
| Backend Service | `site-svc` on port `80` |
| Proof | `curl -H "Host: site.local" localhost` returns HTTP 200 |

### 🔍 How to find it yourself

Start by exploring the Ingress spec so you know every field you need:

```bash
kubectl explain ingress.spec --recursive
kubectl explain ingress.spec.rules --recursive
```

Then look at the imperative helper to understand the shape:

```bash
kubectl create ingress --help
```

Read the examples. They show you the `--rule` flag format. You can use that flag to build the Ingress, or write a YAML file, or use `--dry-run=client -o yaml` to generate a starting template and then fill in the missing fields.

After you create the Ingress, check that Traefik assigned it an address:

```bash
kubectl get ingress site
kubectl describe ingress site
```

Then prove the routing works. Because there is no real DNS for `site.local`, you fake the hostname with a `Host:` header:

```bash
curl -H "Host: site.local" http://localhost/
```

> [!TIP]
> Traefik can take a few seconds to load a new Ingress. If you get 404 right away, wait 5 seconds and run the `curl` again.

> [!IMPORTANT]
> Without `ingressClassName: traefik`, Traefik ignores the Ingress entirely. Your `curl` returns 404 no matter what you do. Double-check that field first if things look wrong.

📖 Docs: [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `curl -H "Host: site.local" http://localhost/` returns HTTP 200, hit **Verify**. ✅
