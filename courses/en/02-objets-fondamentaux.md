# 02 — The Fundamental Kubernetes Objects

> **Objective**: Know each building block, its role, and how they fit together.

---

## Overview

```
Namespace (logical isolation)
  │
  ├── Deployment (manages replicas)
  │     └── ReplicaSet (created by the Deployment — you never touch it directly)
  │           └── Pod (1 container = 1 app)
  │
  ├── Service (stable IP to access Pods)
  │
  ├── ConfigMap (non-sensitive configuration)
  │
  └── Secret (sensitive configuration)
```

---

## Pod — the minimal unit

A Pod = 1 or more containers that share the same network and the same storage.

```
┌──────────────┐
│     Pod      │
│  ┌────────┐  │
│  │ cont 1 │  │  ← your app (e.g.: nginx, node, python)
│  └────────┘  │
│  IP: 10.244.1.5
│  Port: 3000
└──────────────┘
```

**Rules**:
- 1 pod = 1 app (in 95% of cases)
- A pod is **ephemeral**: it can be destroyed and recreated at any time
- Never create a pod on its own — use a Deployment

**Why not a standalone pod?** If a standalone pod crashes, nothing recreates it. A Deployment watches and automatically recreates it.

---

## Deployment — the foreman

The Deployment tells K8s: "I want N copies of my app, always alive."

```
Deployment "mon-app" (replicas: 3)
    │
    └── ReplicaSet (created automatically)
          ├── Pod 1  ✓  Running
          ├── Pod 2  ✓  Running
          └── Pod 3  ✓  Running
```

What the Deployment manages for you:
- **Number of replicas** — if a pod dies, it creates a new one
- **Rolling updates** — zero-downtime updates
- **Rollback** — revert to a previous version
- **History** — keeps old versions (ReplicaSets)

### Minimal Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mon-app
spec:
  replicas: 3                     # how many instances
  selector:
    matchLabels:
      app: mon-app                # MUST match template.labels
  template:
    metadata:
      labels:
        app: mon-app              # label applied to each pod
    spec:
      containers:
      - name: mon-app
        image: nginx:1.25         # NEVER :latest in prod
        ports:
        - containerPort: 80
```

**Classic trap**: `selector.matchLabels` MUST exactly match `template.metadata.labels`. If they don't match, the Deployment will never find its pods.

**Prod rule**: Never use `:latest` as an image tag. Always use a precise version (`nginx:1.25`, `mon-app:v2.3.1`). Otherwise you never know which version is actually running.

---

## Service — the stable address

Pods have ephemeral IPs (a redeployed pod = new IP). A Service provides a **stable IP and DNS name** in front of a group of pods.

```
Service "mon-app-svc" (IP: 10.96.45.12)
    │
    │  selector: app=mon-app  ← targets pods with this label
    │
    ├── Pod 1 (10.244.1.5:80)
    ├── Pod 2 (10.244.1.6:80)
    └── Pod 3 (10.244.2.8:80)
```

### Minimal Service YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mon-app-svc
spec:
  selector:
    app: mon-app              # points to the pods of the Deployment
  ports:
  - port: 80                  # port of the Service (inside the cluster)
    targetPort: 80            # port of the container
  type: ClusterIP             # internal to the cluster (default)
```

### Service types

| Type | Accessible from | Use case |
|---|---|---|
| **ClusterIP** | Inside the cluster only | Communication between internal services |
| **NodePort** | Outside via `<node-IP>:<port>` (30000-32767) | Dev/test, simple direct access |
| **LoadBalancer** | Outside via a cloud LB | **Production** (AWS ALB/NLB, GCP LB) |
| **ExternalName** | DNS alias to an external service | Redirect to an external DB |

**In prod**: ClusterIP for everything internal, LoadBalancer (or Ingress) for anything exposed externally.

---

## Labels and Selectors — the universal glue

K8s does not link objects by IDs. It uses **labels** (key/value pairs) and **selectors** (filters).

```
Deployment                     Service
─────────                      ───────
template:                      selector:
  labels:                        app: mon-app  ← matches!
    app: mon-app ──────────────────────────────┘
```

**This is the most important mechanism to understand.** If the Service selector does not match the pod labels, the Service routes to nothing. This is the number one trap.

To verify:
```bash
# Since K8s 1.33+, "endpoints" is deprecated. Use EndpointSlice:
kubectl get endpointslices -l kubernetes.io/service-name=mon-app-svc

# Old command (still works but displays a warning):
# kubectl get endpoints mon-app-svc

# If the list is empty → the selector does not match any pod
```

---

## Namespace — logical isolation

A namespace is a scope that isolates resources from one another.

```
Cluster
├── default          ← if you specify nothing (avoid in prod)
├── kube-system      ← internal K8s components (DO NOT TOUCH)
├── kube-public      ← public cluster resources
├── production       ← your apps in prod
└── staging          ← your apps in staging
```

**Best practice**: Never deploy to `default` in production. Create namespaces per environment or per team.

```bash
kubectl create namespace production
kubectl get pods -n production        # list the pods of a namespace
kubectl get pods --all-namespaces     # see everything (shorthand: -A)
```

---

## ConfigMap — non-sensitive configuration

Stores configuration as key/value pairs, injected into pods as environment variables or files.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "postgres.production.svc.cluster.local"
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
```

Usage in a Deployment:
```yaml
spec:
  containers:
  - name: mon-app
    envFrom:
    - configMapRef:
        name: app-config    # all keys become env vars
```

---

## Secret — sensitive configuration

Same principle as ConfigMap, but for sensitive data (passwords, tokens, API keys).

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQxMjM=    # base64 encoded (NOT encryption)
  API_KEY: bXktc2VjcmV0LWtleQ==
```

**Warning**: K8s Secrets are base64-encoded, not encrypted. Anyone with access to the namespace can read them. In prod, use an external secrets manager (Vault, AWS Secrets Manager, etc.) or enable etcd encryption at rest.

```bash
# Create a secret imperatively
kubectl create secret generic app-secrets \
  --from-literal=DB_PASSWORD=password123

# Read a secret (decode base64)
kubectl get secret app-secrets -o jsonpath='{.data.DB_PASSWORD}' | base64 -d
```

---

## How it all fits together

```
┌─ Namespace "production" ───────────────────────────────────┐
│                                                            │
│  ConfigMap "app-config"                                    │
│    DATABASE_HOST=postgres.production.svc.cluster.local     │
│                    │                                       │
│                    │ injected into                          │
│                    ▼                                       │
│  Deployment "mon-app" (replicas: 3)                        │
│    │                                                       │
│    ├── Pod 1 [label: app=mon-app]                          │
│    ├── Pod 2 [label: app=mon-app]                          │
│    └── Pod 3 [label: app=mon-app]                          │
│              ▲                                             │
│              │ selector: app=mon-app                        │
│              │                                             │
│  Service "mon-app-svc" (ClusterIP)                         │
│                                                            │
│  Secret "app-secrets"                                      │
│    DB_PASSWORD=***                                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Quick glossary

| Term | Definition |
|---|---|
| **Manifest** | Your YAML file that describes what you want |
| **Label** | Key/value tag on a resource (`app: mon-app`) |
| **Selector** | Filter that targets resources via their labels |
| **ReplicaSet** | Intermediate object between Deployment and Pods (you never touch it directly) |
| **Endpoint** | IP:port of a pod targeted by a Service |
| **Annotation** | Extra metadata (not used for selection) |
