## Pourquoi Kubernetes existe

Tu as une app dans un conteneur. Facile. Maintenant, fais tourner
**50 conteneurs sur 10 serveurs** et garde-les en vie à 3 h du matin quand une
machine lâche. Voilà le problème que Kubernetes résout.

Sans orchestrateur, tu fais tout à la main :

- décider quel serveur exécute quel conteneur ; rééquilibrer quand l'un sature
- redémarrer les conteneurs qui plantent ; les replanifier quand un nœud entier meurt
- livrer une nouvelle version sans coupure, et revenir en arrière quand ça casse

> [!NOTE]
> Kubernetes (écrit **K8s** : « K », 8 lettres, « s ») est un **orchestrateur de
> conteneurs**. Tu déclares l'*état désiré* de ton système, et il travaille sans
> relâche pour que la réalité y corresponde.

Tu ne dis pas « démarre ce conteneur sur ce serveur ». Tu **déclares** ce que tu
veux (« je veux 3 copies de cette app, en permanence ») et Kubernetes trouve le
comment, et le **maintient vrai** même quand les machines tombent.

Dans les étapes suivantes, tu découvriras la mécanique qui rend cela possible.

📖 Docs: [Aide-mémoire kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
