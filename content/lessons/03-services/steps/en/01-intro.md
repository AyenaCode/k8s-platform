## Why Services exist

Pods are **ephemeral**: they restart, reschedule, and scale out, and every new Pod
gets a **different IP**. You can never hardcode a Pod IP and call it stable.

A **Service** fixes that. It is a **stable virtual IP + a DNS name** that kube-proxy
keeps pointing at whatever Pods currently match its **label selector**. Pods come and
go; the Service address never changes.

```text
  Service "web"
  ┌──────────────────────────┐
  │ ClusterIP  10.43.x.x     │
  │ selector:  app=web       │
  └────────┬─────────────────┘
           │ routes to
    ┌──────┴──────┐
  Pod:web-a    Pod:web-b    ← come and go
```

> [!NOTE]
> kube-proxy programs iptables (or IPVS) rules on every node so that traffic
> to the ClusterIP is redirected to a real Pod. You never talk to Pods directly.

The four Service types:

| Type | Reachable from | Typical use |
|------|----------------|-------------|
| **ClusterIP** (default) | inside the cluster | service-to-service |
| **NodePort** | `<nodeIP>:<30000-32767>` | quick external access / labs |
| **LoadBalancer** | external IP via cloud LB | production ingress on cloud; on k3s the bundled **ServiceLB** fulfills it |
| **ExternalName** | DNS CNAME | alias to an external host |

In this lesson you will expose a Deployment with a ClusterIP, open it to the
outside with a NodePort, and discover it by DNS, all in a live cluster.

**Continue →**
