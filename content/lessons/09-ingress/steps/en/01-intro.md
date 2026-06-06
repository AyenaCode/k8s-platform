## Understand Ingress: one door, many apps

NodePort Services work, but they are clumsy at scale: a random high port per app, no hostnames, no path routing, no TLS. Real clusters expose HTTP through a single smart front door: an **Ingress**.

An Ingress is a set of **L7 routing rules**: match on host and path, forward to a Service. One IP, one port (80/443), any number of apps behind it.

```text
client ─▶ Traefik (:80)
           ├─ site.local ─▶ svc/site-svc
           └─ shop.local ─▶ svc/shop
```

The chain is always **Ingress → Service → Pods**. The Ingress never talks to Pods directly: it forwards to a Service, which load-balances to the Pods.

> [!IMPORTANT]
> An Ingress is just a configuration object. Without a running **Ingress Controller** to read and enforce those rules, nothing happens. This cluster runs **Traefik** as the controller: it watches Ingress objects and updates its routing table in real time. The IngressClass is named **`traefik`**; you must set `ingressClassName: traefik` so Traefik picks up your Ingress.

> [!NOTE]
> Traefik ships bundled with k3s and listens on port **80** (HTTP) and **443** (HTTPS) on the node. You do not need to install anything: it is already running.

In this lesson you will expose an app through a Service, then route public HTTP traffic to it with an Ingress, and prove it with a real live request.

**Continue →**
