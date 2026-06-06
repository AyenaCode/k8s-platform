## Understand requests, limits & QoS classes

Every container can declare two resource numbers for CPU and memory.

- **`requests`** — what the container is *guaranteed*. The scheduler uses requests
  to find a node with enough room. This is a **reservation**.
- **`limits`** — the hard *ceiling*. Exceed the **memory** limit and the kernel
  **OOMKills** the container (exit 137). Exceed the **CPU** limit and the container
  is **throttled** — slowed, never killed.

```yaml
resources:
  requests: { cpu: "100m", memory: "64Mi" }   # 100m = 0.1 CPU core
  limits:   { cpu: "200m", memory: "128Mi" }
```

From those two numbers Kubernetes assigns each Pod a **Quality of Service class**,
which determines who gets evicted first when a node runs low on memory:

| QoS class | Rule | Evicted… |
|---|---|---|
| **Guaranteed** | every container sets cpu **and** memory, and `limits == requests` | **last** |
| **Burstable** | has some request or limit, but not Guaranteed | in the middle |
| **BestEffort** | no requests or limits at all | **first** |

> [!IMPORTANT]
> `requests` = scheduling protection — the scheduler will not place a Pod on a node
> that cannot satisfy them. `limits` = runtime containment — the kernel enforces them
> live. Set memory `requests == limits` for anything that must not be OOMKilled.

In this lesson you will build a **Guaranteed** Pod, then deliberately blow past a
memory limit and watch the kernel kill it.

**Continue →**
