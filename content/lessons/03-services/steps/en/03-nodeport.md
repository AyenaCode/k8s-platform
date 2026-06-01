## Reach it from outside (NodePort)

A ClusterIP is only reachable *inside* the cluster. A **NodePort** opens a port
(30000–32767) on every node, forwarding it to the Service.

Create a NodePort Service named **`web-np`** for the same Deployment:

```bash
kubectl expose deployment web --name=web-np --type=NodePort --port=80
```

Find the assigned port and hit it on `localhost` (your terminal *is* the node):

```bash
kubectl get svc web-np
# web-np   NodePort   10.43.x   <none>   80:31234/TCP

PORT=$(kubectl get svc web-np -o jsonpath='{.spec.ports[0].nodePort}')
curl localhost:$PORT          # 🎉 the nginx welcome page, from outside the cluster
```

> Because this lab's terminal shares the node's network, `localhost:<nodePort>`
> reaches your app exactly like a real node would. On a cloud cluster you'd use a
> **LoadBalancer** instead for a clean external IP.

Create the **`web-np`** NodePort Service, confirm `curl localhost:$PORT` works,
then click **Verify**. ✅
