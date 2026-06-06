## Recon: explore your live cluster

Enough theory. You have a **real** cluster in the terminal. Map it.

### Drills

**1. Where is the API server?**

```bash
kubectl cluster-info
```

**2. The machines (nodes):**

```bash
kubectl get nodes -o wide      # IPs, OS, kernel, container runtime
```

**3. Everything running, in every namespace:**

```bash
kubectl get pods -A            # -A = all namespaces; see the kube-system add-ons
```

**4. What can this cluster even do?**

```bash
kubectl api-resources          # every object type, with its short name
```

> [!NOTE]
> Because this is **k3s**, `kube-system` shows add-ons like `coredns`, `traefik`,
> `metrics-server` and `local-path-provisioner`, not the control-plane pods you'd
> meet on a kubeadm cluster (those live inside the k3s process).

### Your task

A **namespace** is how a cluster is partitioned into isolated slices: different
teams or apps, same cluster. Carve out your own:

```bash
kubectl create namespace recon
```

Confirm it exists:

```bash
kubectl get namespaces
```

Then hit **Verify** to complete your first mission. ✅
