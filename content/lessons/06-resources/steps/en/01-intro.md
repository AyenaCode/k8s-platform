## Requests, limits, and QoS classes

Think of a container like a guest at a restaurant.

- **`requests`**: the seat it **reserves**. The kitchen (scheduler) will not seat a guest on a node that does not have room.
- **`limits`**: the max food it is **allowed to eat**. Eat past the memory limit and the kernel kicks it out (OOMKill, exit 137). Go over the CPU limit and it just gets slowed down, never killed.

From those two numbers Kubernetes gives every Pod a **Quality of Service (QoS) class**, which sets the eviction order when a node runs low on memory:

| QoS class | Rule | Evicted |
|---|---|---|
| **Guaranteed** | every container sets cpu AND memory, limits == requests | last |
| **Burstable** | some request or limit set, but not Guaranteed | middle |
| **BestEffort** | nothing set at all | first |

> [!IMPORTANT]
> `requests` protect the Pod at **scheduling time**. `limits` protect the node at **runtime**. They are different levers, both matter.

Explore the resource fields before you touch anything:

```bash
kubectl explain pod.spec.containers.resources --recursive
```

📖 Docs: [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) · [Pod QoS Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/)

**Continue to the first task.**
