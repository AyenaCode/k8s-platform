## Créer un Deployment

Une seule commande crée un Deployment, un ReplicaSet et trois Pods, tous liés entre eux. Tu dois trouver cette commande toi-même : c'est tout le principe.

### 🎯 Mission

| Champ    | Valeur  |
|----------|---------|
| Kind     | Deployment |
| Nom      | `web` |
| Image    | `nginx` |
| Replicas | `3` (tous `Running`, READY `1/1`) |

### 🔍 Comment la trouver toi-même

Tu veux *créer* quelque chose. Quel verbe `kubectl` crée un Deployment de façon impérative ? Commence ici :

```bash
kubectl create --help             # liste les sous-ressources que tu peux créer
kubectl create deployment --help  # lis le SYNOPSIS et les premiers exemples
```

L'aide te montre tous les flags nécessaires. Construis ta propre ligne à partir de là.

Après la création, inspecte toute la chaîne de propriété :

```bash
kubectl get deploy,rs,pods
kubectl describe deployment web
```

> [!TIP]
> Pods bloqués sur `ContainerCreating` ? L'image se télécharge pour la première fois. Attends quelques secondes et relance. C'est normal.

📖 Docs : [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `web` affiche **3/3 ready**, clique sur **Vérifier**. ✅
