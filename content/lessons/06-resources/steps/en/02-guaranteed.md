## Build a Guaranteed Pod

**Guaranteed** is the highest QoS class. It means the node **guarantees** the container will never be evicted for memory pressure, because it reserved exactly what it needs. The rule is strict: every container must set cpu AND memory, and `limits` must equal `requests` for each.

> [!NOTE]
> Pod resource fields are immutable after creation. If you need to change them, delete the Pod and re-apply.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Kind | Pod |
| Name | `guaranteed-demo` |
| Image | `nginx:1.27` |
| cpu request | `100m` |
| memory request | `64Mi` |
| QoS class | `Guaranteed` (limits == requests for both cpu and memory) |

### 🔍 How to find it yourself

First, look up every field name the `resources` block accepts:

```bash
kubectl explain pod.spec.containers.resources
kubectl explain pod.spec.containers.resources.requests
kubectl explain pod.spec.containers.resources.limits
```

Those commands show you the exact field names, types, and what values they accept. Build the Pod spec from that output.

Once the Pod is running, check what class Kubernetes assigned:

```bash
kubectl get pod guaranteed-demo -o jsonpath='{.status.qosClass}{"\n"}'
kubectl describe pod guaranteed-demo | grep -i qos
```

> [!TIP]
> If the class is not `Guaranteed`, re-read the rule: **both** cpu and memory must appear in `requests` AND in `limits`, and the values must match exactly.

📖 Docs: [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) · [Pod QoS Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/) · [kubectl quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `guaranteed-demo` is Running and its QoS class is `Guaranteed`, hit **Verify**. ✅
