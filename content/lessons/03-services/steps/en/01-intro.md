## Why Services?

Pods are **ephemeral**: they're created and destroyed constantly (scaling,
updates, crashes), and each gets a **new IP** every time. So you can never rely on
a Pod's IP to talk to your app.

A **Service** solves this. It is a **stable network identity** — a fixed virtual
IP *and* a DNS name — that load-balances traffic across whatever Pods currently
match its **label selector**.

```
            Service "web"  (stable IP 10.43.x + DNS "web")
                  │  selector: app=web
        ┌─────────┼─────────┐
      Pod        Pod        Pod      ← come and go; the Service tracks them
```

The four Service types you'll meet:

| Type | Reachable from | Use |
|------|----------------|-----|
| **ClusterIP** (default) | inside the cluster | service-to-service |
| **NodePort** | `<nodeIP>:<30000-32767>` | quick external access / labs |
| **LoadBalancer** | cloud LB external IP | production ingress on cloud |
| **ExternalName** | DNS CNAME | alias to an external host |

In this lesson you'll expose a Deployment with a ClusterIP, reach it from outside
with a NodePort, and discover it by DNS — all live.
