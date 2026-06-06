## Route HTTP traffic with an Ingress

Create the front door. This Ingress tells Traefik: any request with `Host: site.local` goes to `site-svc` on port 80.

### Your task

**1. Apply the Ingress.**

```bash
kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: site
spec:
  ingressClassName: traefik
  rules:
  - host: site.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: site-svc
            port:
              number: 80
EOF
```

**2. Watch Traefik assign an address** (may take a few seconds).

```bash
kubectl get ingress site
```

What good looks like:

```text
NAME   CLASS     HOSTS        ADDRESS       PORTS   AGE
site   traefik   site.local   172.x.x.x     80      10s
```

**3. Prove the routing.** There is no DNS for `site.local`, so fake the hostname with a `Host:` header, and Traefik routes on that header alone.

```bash
curl -H "Host: site.local" http://localhost/
```

You should see the nginx welcome page (HTTP 200).

**4. Confirm wrong hosts are rejected**: no rule matches, so Traefik returns 404.

```bash
curl -i -H "Host: wrong.local" http://localhost/ | head -1
```

What good looks like:

```text
HTTP/1.1 404 Not Found
```

> [!TIP]
> Traefik may take a few seconds to load a newly applied Ingress. If `curl` returns 404 right away, wait 5 seconds and retry.

> [!IMPORTANT]
> `ingressClassName: traefik` tells Traefik this Ingress belongs to it. Leave it out and Traefik ignores the object entirely: your curl will return 404 no matter what.

When `curl -H "Host: site.local" http://localhost/` returns HTTP 200, then hit **Verify**. ✅
