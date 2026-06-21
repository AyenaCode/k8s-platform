## Définis ce que « sain » signifie avant de déployer

« Le processus tourne-t-il ? » est une définition trop faible de *sain*. Un
conteneur peut être **actif mais inutile** : bloqué sur un deadlock, encore en
train de charger un cache, en attente d'une base de données.
Tu définis ce que *sain* signifie avec des **probes**. Le kubelet s'en sert pour agir.

Deux analogies pour retenir la différence :

- **Readiness** = « Es-tu prêt à accueillir des clients ? » Un magasin qui n'est pas
  encore installé ne devrait pas recevoir de clients. Pas de redémarrage, juste
  aucun trafic.
- **Liveness** = « Es-tu encore vivant ? » Un magasin qui a planté et ne peut plus
  servir personne doit fermer et rouvrir. Le kubelet tue et redémarre le conteneur.

| Probe | Question à laquelle elle répond | Action en cas d'échec |
|---|---|---|
| **readiness** | « Puis-je servir du trafic maintenant ? » | Retirée des endpoints du Service, aucun redémarrage |
| **liveness** | « Suis-je encore vivant, ou bloqué ? » | Le kubelet tue et redémarre le conteneur |
| **startup** | « Ai-je fini de démarrer ? » | Bloque readiness et liveness jusqu'au démarrage de l'app |

Chaque probe vérifie l'état de l'une de ces trois façons : `exec` (commande ;
exit 0 = sain), `httpGet` (endpoint HTTP ; 2xx-3xx = sain), ou `tcpSocket`
(port ouvert = sain).

Explore toi-même la liste complète des champs :

```bash
kubectl explain pod.spec.containers.readinessProbe --recursive
kubectl explain pod.spec.containers.livenessProbe --recursive
```

> [!WARNING]
> Pointer une probe de **liveness** vers quelque chose de lent ou d'instable
> provoque des redémarrages en boucle. En cas de doute, préfère **readiness** :
> elle ne redémarre jamais, elle retire simplement le Pod de la rotation.

📖 Docs : [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

Tu vas ensuite faire en sorte que la readiness filtre le trafic, puis regarder la
liveness redémarrer un conteneur bloqué.
