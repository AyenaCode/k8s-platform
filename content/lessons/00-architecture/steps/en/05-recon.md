## Recon: explore your live cluster

Enough theory. You have a **real** cluster in the terminal. Map it first, then
carve out your own slice of it.

A **namespace** is how a cluster is partitioned: different teams or apps share
the same cluster but stay isolated in their own slice. Think of it like a folder:
same drive, separate space.

### Explore first

Run these recon commands and read the output:

```bash
kubectl cluster-info
kubectl get nodes -o wide
kubectl get pods -A
```

> [!NOTE]
> Because this is **k3s**, `kube-system` shows add-ons like `coredns` and
> `traefik`, not separate control-plane pods. That is normal.

### 🎯 Mission

| What | Spec |
|------|------|
| Resource | Namespace |
| Name | `recon` |
| State | must exist in the cluster |

### 🔍 How to find it yourself

You need to **create** a namespace. Which `kubectl` verb does that? Ask the tool:

```bash
kubectl create --help
```

Then narrow down to the specific resource:

```bash
kubectl create namespace --help
```

Read the synopsis. Build your own command from the flags shown there.

To check what namespaces exist before and after:

```bash
kubectl get namespaces
```

> [!TIP]
> `kubectl api-resources` lists every object type the cluster knows. Short names
> are shown there too, which saves typing.

📖 Docs: [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/) · [Command line tool (kubectl)](https://kubernetes.io/docs/reference/kubectl/)

When namespace `recon` exists, hit **Verify**. ✅
