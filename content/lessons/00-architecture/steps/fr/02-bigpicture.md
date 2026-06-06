## Vue d'ensemble : control plane + nœuds

Un cluster Kubernetes est un groupe de machines réparties en deux rôles : le
**cerveau** qui décide, et les **muscles** qui exécutent tes conteneurs.

```text
   CONTROL PLANE · le cerveau
   ────────────────────────────────────
   kubectl ─▶ kube-apiserver ─▶ etcd
              scheduler · controller-mgr
                     │
                     ▼  place un Pod sur…
   NŒUDS DE TRAVAIL · les muscles
   ────────────────────────────────────
   nœud ▸ kubelet · kube-proxy · runtime
   nœud ▸ [Pod] [Pod] … [Pod]
```

- Le **control plane** prend les décisions globales et stocke la vérité.
- Les **nœuds de travail** exécutent tes vrais conteneurs, dans des Pods.

### La boucle de réconciliation : le battement de cœur de K8s

Tout repose sur une boucle simple, répétée à l'infini :

```text
   observer ─▶ comparer ─▶ agir ─▶ répéter ↻
   courant     vs désiré   corrige l'écart
```

Tu écris l'**état désiré** (« 3 replicas »). Un **contrôleur** observe l'**état
courant**, voit que 2 seulement tournent, et en crée 1 de plus. Un nœud meurt ? La
boucle le remarque et replanifie ailleurs. Ça ne s'arrête jamais.

> [!TIP]
> Retiens ceci : **déclarer l'état désiré → les contrôleurs réconcilient → répéter.**
> Presque tout comportement de Kubernetes est une variation de cette seule idée.
