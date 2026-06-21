## Exposer le backend avec un Service

Un Ingress route vers un **Service**, jamais directement vers les Pods. Pense au Service comme au couloir interne : l'Ingress envoie les visiteurs vers le bon couloir, et le couloir les distribue aux chambres (Pods).

La plateforme a pré-créé un Deployment nommé **`site`** (nginx). Clique sur **Préparer la tâche** si ce n'est pas encore fait.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Kind | Service (ClusterIP) |
| Nom | `site-svc` |
| Cible | Deployment `site` |
| Port | `80` |
| Au moins un endpoint | oui |

### 🔍 Comment la trouver toi-même

D'abord, vois ce qui existe déjà :

```bash
kubectl get deploy site
kubectl get svc,endpoints
```

Tu dois exposer le Deployment. Quel verbe `kubectl` crée un Service depuis un Deployment ? Demande à l'outil :

```bash
kubectl expose --help
```

Lis le SYNOPSIS et les exemples. Tu veux exposer un **deployment**, nommer le Service `site-svc`, et le lier sur le port `80`. Construis ta propre commande depuis ce que tu lis.

Après avoir créé le Service, vérifie qu'il a des endpoints actifs :

```bash
kubectl get endpoints site-svc
```

La colonne `ENDPOINTS` doit afficher une IP, pas `<none>`. Si elle affiche `<none>`, attends quelques secondes que le Pod devienne Ready et réessaie.

> [!NOTE]
> Un Service ClusterIP n'est accessible qu'à l'intérieur du cluster. C'est exactement ce qu'il faut : l'Ingress (étape suivante) devient la façade publique, et il parle au Service en interne.

📖 Docs : [Service](https://kubernetes.io/docs/concepts/services-networking/service/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Lorsque `site-svc` existe sur le port 80 avec au moins un endpoint, clique sur **Vérifier**. ✅
