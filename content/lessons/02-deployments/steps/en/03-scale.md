## Scale the Deployment

Scaling is a single command. The Deployment tells the ReplicaSet to change its target count; the ReplicaSet creates or terminates Pods immediately.

### Your task

**1. Scale `web` from 3 replicas to 5:**

```bash
kubectl scale deployment web --replicas=5
```

**2. Watch the two new Pods come up:**

```bash
kubectl get pods -l app=web
```

What good looks like:

```text
NAME                READY   STATUS    RESTARTS
web-74d9c-aaaa      1/1     Running   0
web-74d9c-bbbb      1/1     Running   0
web-74d9c-cccc      1/1     Running   0
web-74d9c-dddd      1/1     Running   0
web-74d9c-eeee      1/1     Running   0
```

> [!TIP]
> Scaling down works the same way — `--replicas=2` and Kubernetes terminates
> the extra Pods gracefully. The Deployment's contract is simple:
> *make the running count equal the desired count, always.*

> [!NOTE]
> In production you rarely scale by hand. A **HorizontalPodAutoscaler** (HPA)
> watches CPU/memory and calls `scale` for you — but the underlying mechanism
> is identical to what you just ran.

When all **5 replicas are ready**, then hit **Verify**. ✅
