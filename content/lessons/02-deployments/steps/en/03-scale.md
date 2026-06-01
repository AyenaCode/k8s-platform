## Scale it

Scaling is changing a single number. Take `web` from 3 replicas to **5**:

```bash
kubectl scale deployment web --replicas=5
```

Watch two new Pods appear:

```bash
kubectl get pods -l app=web
```

You can scale down just as easily (`--replicas=2`) — Kubernetes terminates the
extra Pods. The Deployment's job is simply: *make the number of running Pods
match the desired count*, always.

> In production you rarely scale by hand — a **HorizontalPodAutoscaler** watches
> CPU/memory and scales for you. But it's the same mechanism underneath.

Scale `web` to **5 replicas**, wait until all 5 are ready, then click **Verify**. ✅
