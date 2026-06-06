## Définis ce que « sain » signifie avant de déployer

« Le processus tourne-t-il ? » est une définition trop faible de *sain*. Un
conteneur peut être **actif mais inutile** : bloqué sur un deadlock, encore en
train de charger un cache, en attente d'une base de données. Le kubelet ne sait
ce que *sain* signifie que si **tu** le lui dis, avec des **probes** (sondes).

Il en existe trois, chacune ayant un rôle bien distinct :

| Probe | Ce à quoi elle répond | Action en cas d'échec |
|---|---|---|
| **readiness** | « Puis-je servir du trafic *maintenant* ? » | Retirée des endpoints du Service, **aucun redémarrage** |
| **liveness** | « Suis-je encore vivant, ou bloqué ? » | Le kubelet **tue et redémarre** le conteneur |
| **startup** | « Ai-je fini de démarrer ? » | Bloque readiness + liveness jusqu'au démarrage de l'app |

Les deux que tu utiliseras dans presque chaque déploiement :

- **Readiness** protège tes utilisateurs. Un Pod en échec continue de tourner mais
  ne reçoit **aucun trafic** jusqu'à son rétablissement, idéal pour le préchauffage
  et les surcharges temporaires.
- **Liveness** protège ton application contre elle-même. Un Pod en échec est
  **redémarré**, ce qui casse un deadlock sans intervention humaine.

Chaque probe vérifie l'état de l'une de ces trois façons : `exec` (commande ;
exit 0 = sain), `httpGet` (endpoint HTTP ; 2xx–3xx = sain), ou `tcpSocket`
(port ouvert = sain).

> [!WARNING]
> Pointer une probe de **liveness** vers quelque chose de lent ou d'instable
> provoque des redémarrages en boucle. En cas de doute, préfère **readiness** :
> elle ne redémarre jamais, elle retire simplement le Pod de la rotation.

Tu vas ensuite observer la readiness filtrer le trafic, puis regarder la
liveness redémarrer un conteneur bloqué.

**Continuer →**
