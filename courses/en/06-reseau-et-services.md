# 06 — Networking and Services

> **Objective**: Understand how pods communicate with each other and how traffic arrives from outside.

---

## The K8s network model

### Fundamental rule: flat network

```
Pod A (10.244.1.5)  →  can talk to  →  Pod B (10.244.2.8)
        ↑                                       ↑
   Worker Node 1                          Worker Node 2
```

Each pod has its own IP. All pods can reach each other directly **without NAT**, even if they are on different nodes.

The CNI (Container Network Interface) implements this. Common CNIs:
- **Calico** — the most widely used in prod, supports Network Policies
- **Cilium** — modern, eBPF-based, performant
- **Flannel** — simple, good for getting started

### Problem: pod IPs are ephemeral

A pod that restarts = new IP. You cannot hardcode IPs in your config.

Solution: **Services**.

---

## Service — stable IP and DNS

A Service provides a stable address in front of a group of pods:

```
Service "api-svc" (IP: 10.96.45.12)
    │
    │  selector: app=api
    │
    ├── Pod A (10.244.1.5)   ← IP can change
    ├── Pod B (10.244.1.6)   ← IP can change
    └── Pod C (10.244.2.8)   ← IP can change
```

The Service IP never changes as long as the Service exists.

---

## The 4 Service types

### ClusterIP (default) — internal only

```
┌─── Cluster ──────────────────────────┐
│                                      │
│  Pod client                          │
│    curl http://api-svc:80            │
│      │                               │
│      ▼                               │
│  Service "api-svc" (ClusterIP)       │
│      │                               │
│      ├── Pod api-1                   │
│      └── Pod api-2                   │
│                                      │
│  ✗ Not accessible from outside       │
└──────────────────────────────────────┘
```

**Use case**: communication between microservices inside the cluster.

### NodePort — exposes on every node

```
Outside
  │
  │  http://<node-IP>:31234
  │
  ▼
┌─── Cluster ──────────────────────────┐
│                                      │
│  Service (NodePort: 31234)           │
│      │                               │
│      ├── Pod 1                       │
│      └── Pod 2                       │
└──────────────────────────────────────┘
```

- K8s opens a port between 30000 and 32767 on **every** node
- Accessible from outside via `<any-node-IP>:<NodePort>`
- **Use case**: dev, testing, basic direct access

### LoadBalancer — the prod standard

```
Internet
  │
  │  http://my-domain.com
  │
  ▼
┌─── Cloud Load Balancer (AWS ALB, GCP LB) ─┐
│                                             │
│  Distributes traffic across nodes           │
│                                             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─── Cluster ──────────────────────────┐
│                                      │
│  Service (LoadBalancer)              │
│      │                               │
│      ├── Pod 1                       │
│      ├── Pod 2                       │
│      └── Pod 3                       │
└──────────────────────────────────────┘
```

- K8s asks the cloud provider to create a load balancer
- The LB receives a public IP
- **Use case**: production, exposing services to users

**Cost**: Each LoadBalancer Service = 1 cloud load balancer = billing. To expose multiple services, use an **Ingress** instead.

### ExternalName — DNS alias

Redirects to an external service. No proxy, just a DNS alias.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ma-bdd
spec:
  type: ExternalName
  externalName: db.example.com    # redirige vers cette adresse
```

---

## Internal DNS — CoreDNS

K8s includes a DNS server (CoreDNS). Every Service is automatically registered:

```bash
# From any pod in the SAME namespace:
curl http://mon-service

# From a DIFFERENT namespace:
curl http://mon-service.autre-namespace

# Full form (FQDN):
curl http://mon-service.mon-namespace.svc.cluster.local
```

**DNS format**: `<service-name>.<namespace>.svc.cluster.local`

**Gotcha**: If you are in the `staging` namespace and want to call a service in `production`, you MUST specify the namespace:
```bash
curl http://api-svc.production        # OK
curl http://api-svc                   # No — looks in staging
```

---

## Ports — how traffic flows

```
EXTERNAL           SERVICE            CONTAINER
(browser)          (cluster)          (your app)

:31234       →     :80          →     :3000
(NodePort)         (port)             (targetPort)
```

| Port | Definition | Who controls it |
|---|---|---|
| **nodePort** | Port on the node (30000-32767) | K8s assigns it or you choose it |
| **port** | Service port inside the cluster | You define it |
| **targetPort** | Port your app listens on | Must match your app's code |

**The most common gotcha**: `targetPort` does not match the port your app actually listens on. Result: the Service sends traffic to the wrong place, connection refused.

---

## Endpoints — proof that the Service works

EndpointSlices are the list of pod IPs to which the Service routes traffic.

```bash
# From K8s 1.33+, use EndpointSlice (endpoints is deprecated):
kubectl get endpointslices -l kubernetes.io/service-name=mon-service
# NAME                ADDRESSTYPE   PORTS   ENDPOINTS                       AGE
# mon-service-abc12   IPv4          3000    10.244.1.5,10.244.1.6           5m

# If the ENDPOINTS column is empty → the Service selector matches no pod!
```

**Debug reflex**: Service unreachable? Check the EndpointSlices first.

---

## Network Policies — K8s's firewall

By default, all pods can talk to all pods. Network Policies let you restrict that.

```yaml
# Example: only pods with label "role: frontend" 
# can access pods with "role: api"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-frontend
spec:
  podSelector:
    matchLabels:
      role: api
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - port: 80
```

**Important**: Network Policies only work if your CNI supports them (Calico, Cilium = yes; Flannel = no).

---

## Ingress — a single entry point for multiple services

Instead of creating one LoadBalancer per service, an Ingress handles HTTP routing:

```
Internet
  │
  ▼
┌─── Ingress Controller (nginx, traefik...) ───┐
│                                                │
│  /api/*     →  Service api-svc                 │
│  /web/*     →  Service web-svc                 │
│  /admin/*   →  Service admin-svc               │
│                                                │
└────────────────────────────────────────────────┘
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mon-ingress
spec:
  rules:
  - host: mon-domaine.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-svc
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80
```

**Prerequisite**: An Ingress Controller must be installed in the cluster (nginx-ingress, traefik, etc.). The Ingress object alone does nothing without a controller.

---

## Summary: which Service type to use?

```
Internal communication between services?        →  ClusterIP
Quick local test?                               →  NodePort
Expose in prod?                                 →  LoadBalancer or Ingress
Multiple HTTP services behind one domain?       →  Ingress
Point to an external service?                   →  ExternalName
```
