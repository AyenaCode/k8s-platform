# 01 — Kubernetes Architecture

> **Objective**: Understand how K8s is built so you know *where to look* when something breaks.

---

## K8s in one sentence

Kubernetes deploys, scales, and keeps your containerized applications alive — automatically.

You describe what you want. K8s makes sure it stays that way.

---

## The two zones of the cluster

```
┌─────────────────────────────────────────────────────────────┐
│                        CLUSTER K8S                          │
│                                                             │
│   ┌──────────────────────┐   ┌──────────────────────────┐  │
│   │    CONTROL PLANE     │   │      DATA PLANE          │  │
│   │   (the brain)        │   │   (the muscles)          │  │
│   │                      │   │                          │  │
│   │  API Server          │   │  Worker Node 1           │  │
│   │  etcd                │   │  Worker Node 2           │  │
│   │  Scheduler           │   │  Worker Node N           │  │
│   │  Controller Manager  │   │                          │  │
│   └──────────────────────┘   └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Fundamental rule**: The Control Plane decides. The Worker Nodes execute. Everyone goes through the API Server — it is the single entry point.

---

## Control Plane — component by component

### API Server (`kube-apiserver`)

The single entry point of the cluster. Everything goes through it: kubectl, CI/CD, and all internal components.

```
kubectl apply -f app.yaml
        │
        ▼
   API Server  ←→  etcd (saves the state)
        │
        ▼
   Scheduler  →  kubelet (on the Worker Node)
```

What it does:
- Exposes a REST API over HTTPS
- Authenticates and authorizes every request
- Persists state in etcd
- Notifies other components of changes (via the watch mechanism)

**In prod, if the API Server is down**: you can no longer control anything (`kubectl` stops responding), but pods that are already running continue to run.

### etcd

The cluster's memory. A distributed key-value database that stores EVERYTHING in state.

```
Key examples:
  /registry/pods/default/mon-pod         → state of a pod
  /registry/deployments/default/mon-app  → state of a deployment
  /registry/nodes/worker-1               → state of a node
```

**Critical point in prod**:
- If etcd dies → the cluster loses its memory. Pods keep running, but no operations are possible.
- etcd must be backed up regularly (snapshots). It is the most important data in the cluster.
- In production, etcd runs as a cluster of 3 or 5 members for high availability.

### Scheduler (`kube-scheduler`)

Decides which Worker Node to place a new pod on.

```
Algorithm:
  1. Filter  → which nodes have enough CPU/RAM?
  2. Score   → which one is the most suitable (least loaded, affinity, etc.)?
  3. Binding → assigns the pod to the winning node
```

**Important**: The Scheduler does not start pods. It only decides *where*. It is the kubelet on the target node that does the actual work.

### Controller Manager (`kube-controller-manager`)

The guardian of desired state. It contains dozens of controllers running in an infinite loop:

```
Deployment Controller:
  Desired state  : 3 replicas
  Actual state   : 2 replicas (a pod crashed)
  Action         : creates 1 new pod

Node Controller:
  Desired state  : all nodes are responding
  Actual state   : worker-3 has not responded for 5 min
  Action         : marks the node NotReady, reschedules the pods
```

This is the fundamental principle of K8s: the **reconciliation loop** — desired state vs actual state, continuously.

---

## Worker Node — component by component

```
┌─────────────────────────────────────────────┐
│              WORKER NODE                    │
│                                             │
│  kubelet      ←  receives instructions       │
│  kube-proxy   ←  manages the network        │
│  container runtime (containerd)             │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Pod A   │  │  Pod B   │  │  Pod C   │  │
│  │ [cont 1] │  │ [cont 1] │  │ [cont 1] │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

### kubelet

The K8s agent on every node. It:
- Receives pod specs from the API Server (via watch)
- Asks the container runtime to start/stop containers
- Reports pod state back to the API Server (Running, Failed, etc.)
- Runs health checks (liveness/readiness probes)

**In prod**: If the kubelet on a node crashes, pods on that node are no longer monitored. After a timeout (~5 min by default), the Control Plane marks the node NotReady and reschedules the pods elsewhere.

### kube-proxy

The network layer between pods and Services. It:
- Maintains iptables/IPVS rules on the node
- Redirects traffic to the right pod when you call a Service
- Makes `curl mon-service:80` work from any pod

### Container Runtime

Actually starts the containers. K8s supports:
- **containerd** — the current standard
- **CRI-O** — a lightweight alternative
- Docker as a runtime has been deprecated since K8s 1.24 (Docker images still work fine — it is the Docker daemon that is no longer used)

---

## The reconciliation loop — the heart of K8s

```
┌─────────────────────────────────────────────────────┐
│            RECONCILIATION LOOP                      │
│                                                     │
│   Watch(etcd) → Compare → Act → Report → Watch...  │
│                                                     │
│  Deployment Controller : 3 pods desired? 3 ok?      │
│  Node Controller       : node OK? heartbeat?        │
│  Service Controller    : endpoints up to date?      │
└─────────────────────────────────────────────────────┘
```

K8s does not "configure" once — it **watches continuously** and **corrects** any drift. This is why:
- A crashing pod is automatically recreated
- A node that goes down has its pods replaced on other nodes
- A scaling operation is applied continuously until the desired count is reached

---

## Lifecycle of a `kubectl apply` — end to end

```
You type: kubectl apply -f deployment.yaml
                    │
                    ▼
          ┌─────────────────┐
          │   API Server    │  ← validates the YAML, authenticates
          └────────┬────────┘
                   │ saves in etcd
                   ▼
          ┌─────────────────┐
          │   Deployment    │  ← Controller Manager sees the new
          │   Controller    │    deployment, creates a ReplicaSet
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │  ReplicaSet     │  ← creates N Pod objects in etcd
          │  Controller     │    (status: Pending)
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │   Scheduler     │  ← sees Pending pods with no node
          └────────┬────────┘    assigns each pod to a Worker
                   ▼
          ┌─────────────────┐
          │  kubelet        │  ← on the assigned Worker, pulls the image
          │  (Worker Node)  │    and starts the container
          └────────┬────────┘
                   ▼
          ┌─────────────────┐
          │  Pod Running    │  ← kubelet reports the status back
          └─────────────────┘    etcd is updated
```

**Total time**: a few seconds if the image is already cached on the node.

---

## Full diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                           CLUSTER                                │
│                                                                  │
│  ┌────────────────────────────┐                                  │
│  │       CONTROL PLANE        │                                  │
│  │                            │                                  │
│  │  ┌──────────────────────┐  │                                  │
│  │  │     API Server       │◄─┼──── kubectl / CI/CD             │
│  │  └──────────┬───────────┘  │                                  │
│  │             │              │                                  │
│  │  ┌──────────▼───────────┐  │                                  │
│  │  │        etcd          │  │  ← source of truth              │
│  │  └──────────────────────┘  │                                  │
│  │                            │                                  │
│  │  ┌──────────────────────┐  │                                  │
│  │  │  Controller Manager  │  │  ← reconciliation loops         │
│  │  └──────────────────────┘  │                                  │
│  │                            │                                  │
│  │  ┌──────────────────────┐  │                                  │
│  │  │     Scheduler        │  │  ← pod placement                │
│  │  └──────────────────────┘  │                                  │
│  └────────────────────────────┘                                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Worker Node 1│  │ Worker Node 2│  │ Worker Node N│           │
│  │              │  │              │  │              │           │
│  │  kubelet     │  │  kubelet     │  │  kubelet     │           │
│  │  kube-proxy  │  │  kube-proxy  │  │  kube-proxy  │           │
│  │  containerd  │  │  containerd  │  │  containerd  │           │
│  │              │  │              │  │              │           │
│  │  [Pod][Pod]  │  │  [Pod][Pod]  │  │  [Pod]       │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key takeaways

| Component | Role | If it goes down? |
|---|---|---|
| **API Server** | Single entry point | No more control, pods keep running |
| **etcd** | Cluster memory | State lost, pods keep running |
| **Scheduler** | Places pods | New pods stay Pending |
| **Controller Manager** | Reconciliation | No self-healing, no scaling |
| **kubelet** | Agent on each node | Pods on that node no longer monitored |
| **kube-proxy** | Services networking | Services unreachable on that node |

> **Key principle**: K8s is declarative. You describe *what you want*, not *how to do it*. The reconciliation loop does the rest — continuously, indefinitely.
