## Requests, limits & QoS classes

Every container can declare two numbers for CPU and memory:

- **`requests`** — what the container is *guaranteed*. The scheduler uses requests
  to pick a node with enough room. This is a **reservation**.
- **`limits`** — the *ceiling*. Exceed the **memory** limit and the kernel
  **kills** the container (OOMKilled). Exceed the **CPU** limit and you are merely
  **throttled** (slowed), not killed.

```yaml
resources:
  requests: { cpu: "100m", memory: "64Mi" }   # 100m = 0.1 CPU core
  limits:   { cpu: "200m", memory: "128Mi" }
```

From these numbers Kubernetes assigns each Pod a **Quality of Service class**,
which decides who gets evicted first when a node runs out of memory:

| QoS class | Rule | Evicted… |
|---|---|---|
| **Guaranteed** | every container sets cpu **and** memory, and `limits == requests` | **last** |
| **Burstable** | has some request/limit, but not Guaranteed | in the middle |
| **BestEffort** | no requests or limits at all | **first** |

> **Key idea:** requests are about *scheduling and protection*; limits are about
> *containment*. Set memory requests = limits for anything that must not be killed.

In this lesson you will build a **Guaranteed** Pod, then deliberately blow past a
memory limit and watch the kernel **OOMKill** it. →
