## Le control plane — le cerveau

Ces composants prennent les décisions et détiennent la vérité du cluster. Vous y
touchez rarement directement : vous parlez à l'**API server**, et tout le reste
réagit.

| Composant | Son rôle |
|---|---|
| **kube-apiserver** | La porte d'entrée. *Chaque* commande `kubectl`, chaque contrôleur, chaque kubelet parle à cette API REST. Rien ne la contourne. |
| **etcd** | La source unique de vérité — un magasin clé-valeur qui contient **tout** l'état du cluster. Perdre etcd, c'est perdre la mémoire du cluster. |
| **kube-scheduler** | Surveille les nouveaux Pods sans nœud et choisit le meilleur nœud pour chacun (ressources, règles, affinités). |
| **kube-controller-manager** | Exécute les boucles de contrôle intégrées (Deployment, ReplicaSet, Node, Job…) — les réconciliateurs qui alignent la réalité sur l'état désiré. |
| **cloud-controller-manager** | Sur le cloud : crée les load balancers, attache les disques, gère le cycle de vie des nœuds via l'API du fournisseur. |

> [!IMPORTANT]
> Le chemin est toujours : **vous → API server → etcd**, puis **scheduler /
> contrôleurs → API server → nœuds**. L'API server est le point de passage de
> *tout*.

> [!NOTE]
> Ce lab tourne sous **k3s**, qui regroupe tout le control plane (API server,
> scheduler, controller-manager) dans un **seul processus** — vous ne verrez donc
> pas de pods `kube-apiserver` ou `etcd` séparés comme sur un cluster kubeadm. Les
> concepts sont identiques ; seul l'emballage change.
