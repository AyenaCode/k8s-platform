## Reconnaissance : explore ton cluster

Assez de théorie. Tu as un **vrai** cluster dans le terminal.
Cartographie-le.

### Manipulations

**1. Où est l'API server ?**

```bash
kubectl cluster-info
```

**2. Les machines (nœuds) :**

```bash
kubectl get nodes -o wide      # IPs, OS, noyau, container runtime
```

**3. Tout ce qui tourne, dans tous les namespaces :**

```bash
kubectl get pods -A            # -A = tous les namespaces ; vois les add-ons kube-system
```

**4. Que sait faire ce cluster ?**

```bash
kubectl api-resources          # chaque type d'objet, avec son nom court
```

> [!NOTE]
> Comme c'est du **k3s**, `kube-system` affiche des add-ons comme `coredns`,
> `traefik`, `metrics-server` et `local-path-provisioner`, pas les pods du control
> plane qu'on verrait sur un cluster kubeadm (ils vivent dans le processus k3s).

### Ta tâche

Un **namespace** partitionne un cluster en tranches isolées : différentes équipes
ou apps, même cluster. Crée le tien :

```bash
kubectl create namespace recon
```

Confirme qu'il existe :

```bash
kubectl get namespaces
```

Puis clique sur **Vérifier** pour terminer ta première mission. ✅
