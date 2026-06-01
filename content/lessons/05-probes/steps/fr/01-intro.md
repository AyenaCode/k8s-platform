## Liveness vs readiness vs startup

« Le processus du conteneur est-il en cours d'exécution ? » est une définition trop faible de "sain". Un processus peut être **actif mais inutile** — bloqué sur un deadlock, encore en train de charger un cache, ou en attente d'une base de données. Le kubelet ne peut savoir ce que signifie *sain* que si **vous** le lui indiquez, avec des **probes** (ou *sondes*).

Il en existe trois, et elles font des choses très différentes :

| Probe | Ce à quoi elle répond | Ce qui se passe en cas d'échec |
|---|---|---|
| **readiness** | « Puis-je servir du trafic *maintenant* ? » | Le Pod est retiré des endpoints de son Service — **aucun redémarrage** |
| **liveness** | « Suis-je encore vivant, ou bloqué ? » | Le kubelet **tue et redémarre** le conteneur |
| **startup** | « Ai-je fini de démarrer ? » | Bloque les deux autres jusqu'à ce que l'application ait démarré |

Les deux que vous utiliserez le plus :

- **Readiness** protège vos utilisateurs. Un Pod dont la readiness échoue continue de tourner mais ne reçoit **aucun trafic** jusqu'à son rétablissement. Idéal pour la phase de préchauffage et les surcharges temporaires.
- **Liveness** protège votre application contre elle-même. Un Pod dont la liveness échoue est **redémarré**, ce qui rompt un deadlock sans intervention humaine.

Chaque probe peut effectuer sa vérification de trois façons : `httpGet` (un endpoint HTTP), `exec` (exécuter une commande, exit 0 = sain), ou `tcpSocket` (port ouvert).

> **Piège :** pointer une probe de **liveness** vers quelque chose de lent ou d'instable provoque des redémarrages en boucle. En cas de doute, préférez **readiness** — elle ne redémarre jamais, elle retire simplement le Pod de la rotation.

Vous allez ensuite observer la readiness filtrer le trafic, puis regarder la liveness redémarrer un conteneur bloqué. →
