## Reconnaissance : explore ton cluster

Assez de théorie. Tu as un **vrai** cluster dans le terminal. Cartographie-le
d'abord, puis taille-toi une tranche.

Un **namespace** partitionne un cluster : différentes équipes ou apps partagent
le même cluster mais restent isolées dans leur propre tranche. Pense à un dossier :
même disque, espace séparé.

### Explore d'abord

Lance ces commandes de reconnaissance et lis la sortie :

```bash
kubectl cluster-info
kubectl get nodes -o wide
kubectl get pods -A
```

> [!NOTE]
> Comme c'est du **k3s**, `kube-system` affiche des add-ons comme `coredns` et
> `traefik`, pas des pods de control plane séparés. C'est normal.

### 🎯 Mission

| Quoi | Spec |
|------|------|
| Ressource | Namespace |
| Nom | `recon` |
| État | doit exister dans le cluster |

### 🔍 Comment la trouver toi-même

Tu dois **créer** un namespace. Quel verbe `kubectl` fait ça ? Demande à l'outil :

```bash
kubectl create --help
```

Puis affine sur la ressource précise :

```bash
kubectl create namespace --help
```

Lis le synopsis. Construis ta propre commande à partir des options montrées.

Pour voir les namespaces existants avant et après :

```bash
kubectl get namespaces
```

> [!TIP]
> `kubectl api-resources` liste tous les types d'objets que le cluster connaît.
> Les noms courts y figurent aussi, ce qui fait gagner du temps à la frappe.

📖 Docs: [Aide-mémoire kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/) · [Outil en ligne de commande (kubectl)](https://kubernetes.io/docs/reference/kubectl/)

Quand le namespace `recon` existe, clique sur **Vérifier**. ✅
