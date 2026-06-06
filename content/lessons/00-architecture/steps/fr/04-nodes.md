## Les nœuds de travail : les muscles

Chaque machine qui exécute tes charges porte trois pièces :

| Composant | Son rôle |
|---|---|
| **kubelet** | L'agent du nœud. Prend les specs de Pod depuis l'API server et s'assure que ces conteneurs tournent vraiment et sont sains, puis renvoie leur état. |
| **kube-proxy** | Programme les règles réseau du nœud (iptables / IPVS) pour que le trafic vers un **Service** atteigne les bons Pods, où qu'ils soient. |
| **container runtime** | Le moteur qui exécute réellement les conteneurs : **containerd** ou CRI-O, via l'interface CRI. (Le moteur Docker a été retiré en v1.24.) |

```text
   API server
      │  envoie une spec de Pod
      ▼
   kubelet ─▶ runtime ─▶ [ conteneur ]
      │
      ▲── renvoie santé & état vers le haut
```

> [!TIP]
> Modèle mental : le **kubelet** est le chef de chantier du nœud. Il ne décide pas
> *quoi* exécuter (c'est le control plane), il fait juste appliquer les ordres et
> rend compte.

Mis bout à bout, le parcours complet d'une requête est :

**toi** → `kubectl` → **API server** → **etcd** (stocké) → le **scheduler** choisit
un nœud → le **kubelet** de ce nœud → le **runtime** démarre le conteneur. Puis la
**boucle de contrôle** continue de surveiller, pour toujours.
