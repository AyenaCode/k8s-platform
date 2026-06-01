## Why Ingress?

You already know how to reach a Pod from outside with a **NodePort** Service. But
NodePorts are clumsy at scale: a random high port per app, no hostnames, no paths,
no TLS. Real clusters expose **HTTP** through a single smart front door — an
**Ingress**.

An Ingress is a set of **routing rules**: "host `shop.example.com` → the `shop`
Service; path `/api` → the `api` Service". One IP, one port (80/443), many apps.

The rules are useless on their own — they need an **Ingress Controller** to enforce
them (a reverse proxy watching Ingress objects). This cluster ships **Traefik**,
listening on port **80**, with an IngressClass named **`traefik`**.

```
                         ┌── host: shop.local ──▶ Service shop  ──▶ Pods
client ─▶ Traefik (:80) ─┤
                         └── host: site.local ──▶ Service site-svc ──▶ Pods
              ▲
        the Ingress rules tell Traefik how to route
```

The chain is always **Ingress → Service → Pods**. The Ingress never talks to Pods
directly; it forwards to a Service, which load-balances to the Pods.

> **Key idea:** an Ingress is layer-7 (HTTP) routing. Match on host and path, send
> to a Service. Add TLS and you have production-grade ingress with one object.

In this lesson you will put a Service in front of an app, then route public HTTP
traffic to it with an Ingress — and prove it with a real request. →
