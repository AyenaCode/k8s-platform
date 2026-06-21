## Qu'est-ce qu'un Pod ?

Imagine un **Pod** comme une boîte à goûter 🍱. Dedans, il y a en général **une
appli** (un conteneur). Kubernetes ne transporte jamais l'appli toute nue : il
transporte toujours la boîte entière.

Trois choses à retenir :

- tout ce qui est dans la boîte partage **une seule IP** et se parle via `localhost`
- tout ce qui est dans la boîte partage le même **stockage**
- si la boîte casse, **personne ne la ramasse**. Un Pod est jetable. (Le
  *Deployment* est le robot qui la remplace ; c'est la prochaine leçon.)

Tout objet plus gros (Deployment, Job…) n'est qu'une machine à fabriquer des
Pods. Maîtrise ça et le reste suit.

### Reconnaissance

Ton terminal est un vrai shell, `kubectl` est déjà branché à un cluster en
direct. Fais le tour avant de construire :

```bash
kubectl get nodes      # les machines qui exécutent tes boîtes
kubectl get pods       # ce qui tourne maintenant (sans doute rien)
```

> [!TIP]
> **Le réflexe n°1 de tout ce cours :** quand tu ne connais pas une commande,
> demande à l'outil, pas à Google. `kubectl --help` liste tous les verbes ;
> `kubectl run --help` montre comment un verbe marche. Tu vas t'en servir sans arrêt.

📖 Doc : [Pods](https://kubernetes.io/docs/concepts/workloads/pods/) · [Cheat sheet kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
