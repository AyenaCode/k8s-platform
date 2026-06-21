## What is a Pod?

Think of a **Pod** as a lunchbox 🍱. Inside there's usually **one app** (a
container). Kubernetes never carries the bare app around: it always carries the
whole box.

Three things to remember:

- everything in the box shares **one IP** and talks over `localhost`
- everything in the box shares the same **storage**
- if the box breaks, **nobody picks it up**. A Pod is throw-away. (A *Deployment*
  is the robot that replaces it; that's the next lesson.)

Every bigger object (Deployment, Job…) is just a machine that makes Pods. Get
this and the rest is easy.

### Recon

Your terminal is a real shell, `kubectl` is already wired to a live cluster. Look
around before you build:

```bash
kubectl get nodes      # the machines that run your boxes
kubectl get pods       # what's running now (probably nothing)
```

> [!TIP]
> **The #1 reflex of this whole course:** when you don't know a command, ask the
> tool, not Google. `kubectl --help` lists every verb; `kubectl run --help` shows
> how one verb works. You'll lean on this constantly.

📖 Docs: [Pods](https://kubernetes.io/docs/concepts/workloads/pods/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
