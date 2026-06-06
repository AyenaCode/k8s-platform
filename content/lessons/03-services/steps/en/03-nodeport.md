## Open it to the outside with NodePort

A ClusterIP is only reachable inside the cluster. A **NodePort** opens a port in
the range 30000–32767 on every node and forwards traffic to the Service.

### Your task

**1. Create a NodePort Service named `web-np`.**

```bash
kubectl expose deployment web --name=web-np --type=NodePort --port=80
```

**2. Find the assigned node port.**

```bash
kubectl get svc web-np
```

What good looks like:

```text
NAME     TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
web-np   NodePort   10.43.5.67    <none>        80:31234/TCP   5s
```

The `80:31234` means port 80 on the Service maps to node port 31234.

**3. Hit it on `localhost`** — this terminal shares the node's network.

```bash
PORT=$(kubectl get svc web-np -o jsonpath='{.spec.ports[0].nodePort}')
curl localhost:$PORT
```

You get the nginx welcome page, reached from outside the cluster.

> [!NOTE]
> On a real cloud cluster you would use the node's external IP instead of
> `localhost`. For production external access, prefer **type: LoadBalancer** —
> on k3s, the bundled ServiceLB assigns a real external IP automatically.

> [!TIP]
> Already have a ClusterIP Service `web` from the previous step? Good — you can
> have both types in front of the same Deployment at the same time.

Then hit **Verify**. ✅
