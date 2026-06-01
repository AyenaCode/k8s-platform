## Self-healing — watch it in action

This is the magic of the desired-state model. Open **two** things: list the Pods,
then delete one and watch a replacement appear instantly.

```bash
# note one Pod name
kubectl get pods -l app=web

# delete it
kubectl delete pod <one-of-the-pod-names>

# immediately list again — a new Pod is already being created
kubectl get pods -l app=web
```

You asked for 5 replicas; you deleted one; the ReplicaSet noticed `current=4 <
desired=5` and created a fresh Pod within milliseconds. You never have to
intervene.

Try the same with a whole node failure (not possible in this single-node lab) and
the Pods would be rescheduled elsewhere.

> **Key idea:** you declare *what* you want, the controllers relentlessly drive
> reality toward it. This loop — *observe → diff → act* — is the heart of
> Kubernetes.

This step is just to observe — no verification. Hit **Next** when you've seen the
replacement Pod appear. →
