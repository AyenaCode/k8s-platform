## Route traffic with an Ingress

Now create the front door. This Ingress says: *any request for host
`site.local`, path `/`, goes to the `site-svc` Service on port 80.*

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

Look at it — after a moment Traefik fills in an address:

```bash
kubectl get ingress site
# NAME   CLASS     HOSTS        ADDRESS       PORTS   AGE
# site   traefik   site.local   172.x.x.x     80      10s
```

Now **prove the routing**. There is no DNS for `site.local`, so we fake the
hostname with a `Host:` header — Traefik routes on that header alone:

```bash
curl -H "Host: site.local" http://localhost/
# <!DOCTYPE html> ... Welcome to nginx!   (HTTP 200, served via the Ingress)
```

Compare: a request with the **wrong** host gets a 404 from Traefik, because no
rule matches:

```bash
curl -i -H "Host: wrong.local" http://localhost/ | head -1
# HTTP/1.1 404 Not Found
```

That is the whole point — one proxy, routing by host to many backends.

When `curl -H "Host: site.local" http://localhost/` returns **HTTP 200**, click
**Verify**. ✅
