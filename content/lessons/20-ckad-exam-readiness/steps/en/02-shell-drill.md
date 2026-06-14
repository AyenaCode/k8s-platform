## Warm up the exam shell

The real exam rewards fast, boring accuracy. Start with a tiny task that forces
you to type names, namespaces, images and ports exactly.

### Your task

Create a namespace named **`ckad-ready`**.

Inside it, create a Deployment named **`ready-nginx`**:

- image: `nginx:1.27`
- replicas: `1`
- container port: `80`

Expose it with a Service named **`ready-nginx`** on port **80**.

One fast path:

```bash
kubectl create namespace ckad-ready
kubectl create deployment ready-nginx -n ckad-ready --image=nginx:1.27 --port=80
kubectl expose deployment ready-nginx -n ckad-ready --port=80 --target-port=80
kubectl rollout status deployment/ready-nginx -n ckad-ready
kubectl get deploy,svc,endpoints -n ckad-ready
```

Hit **Verify** once the Deployment is available and the Service has endpoints.
