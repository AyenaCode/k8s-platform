## Open it to the outside with NodePort

A ClusterIP only works inside the cluster. A **NodePort** punches a hole: it picks a port in the range 30000-32767 on every node and forwards outside traffic in.

Think of it like opening a specific door on the building so visitors can enter from the street.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Resource to create | Service |
| Name | `web-np` |
| Type | `NodePort` |
| Port | `80` |
| Proof | `curl localhost:<nodePort>` returns HTTP 200 |

### 🔍 How to find it yourself

You already know `kubectl expose`. Now you need to change the type and the name:

```bash
kubectl expose --help              # look for the --type and --name flags
kubectl explain service.spec.type  # see valid type values
```

After creating it, find the assigned node port:

```bash
kubectl get svc web-np
```

The `PORT(S)` column shows `80:<nodePort>/TCP`. Use that port to test from this terminal (it shares the node's network):

```bash
kubectl get svc web-np -o jsonpath='{.spec.ports[0].nodePort}'
```

> [!NOTE]
> On a real cloud cluster you use the node's external IP instead of `localhost`. For production, prefer **type: LoadBalancer**.

📖 Docs: [Service](https://kubernetes.io/docs/concepts/services-networking/service/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `web-np` exists and the node port returns HTTP 200, hit **Verify**. ✅
