## Why Services exist

Think of a Pod like a taxi: it picks you up, drives you somewhere, then disappears. The next taxi has a different plate number. If your app hardcodes a Pod IP, that IP is gone the moment the Pod restarts.

A **Service** is like a taxi dispatch center: you always call the same number, and the center routes you to whichever taxi is available right now.

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

The four Service types:

| Type | Reachable from | Typical use |
|------|----------------|-------------|
| **ClusterIP** (default) | inside the cluster | service-to-service calls |
| **NodePort** | `<nodeIP>:<30000-32767>` | quick external access, labs |
| **LoadBalancer** | external IP via cloud LB | production ingress on cloud |
| **ExternalName** | DNS CNAME | alias to an external host |

> [!NOTE]
> kube-proxy programs routing rules on every node so traffic to the ClusterIP reaches a real Pod. You never talk to Pods directly.

Explore the types before you start:

```bash
kubectl explain service.spec.type
```

📖 Docs: [Service](https://kubernetes.io/docs/concepts/services-networking/service/)

**Continue →**
