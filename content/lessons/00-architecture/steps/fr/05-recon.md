## Reconnaissance — explorez votre cluster

Assez de théorie. Vous avez un **vrai** cluster dans le terminal à droite.
Cartographiez-le.

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
kubectl get pods -A            # -A = tous les namespaces ; voyez les add-ons kube-system
```

**4. Que sait faire ce cluster ?**

```bash
kubectl api-resources          # chaque type d'objet, avec son nom court
```

> [!NOTE]
> Comme c'est du **k3s**, `kube-system` affiche des add-ons comme `coredns`,
> `traefik`, `metrics-server` et `local-path-provisioner` — pas les pods du control
> plane qu'on verrait sur un cluster kubeadm (ils vivent dans le processus k3s).

### Votre tâche

Un **namespace** partitionne un cluster en tranches isolées — différentes équipes
ou apps, même cluster. Créez le vôtre :

```bash
kubectl create namespace recon
```

Confirmez qu'il existe :

```bash
kubectl get namespaces
```

Puis cliquez sur **Vérifier** pour terminer votre première mission. ✅
