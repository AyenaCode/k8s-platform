## Comprendre l'Ingress : une seule porte, plusieurs apps

Les Services NodePort fonctionnent, mais ils deviennent vite ingérables à grande échelle : un port élevé aléatoire par app, pas de noms d'hôte, pas de routage par chemin, pas de TLS. Les vrais clusters exposent le HTTP via une seule porte d'entrée intelligente : un **Ingress**.

Un Ingress est un ensemble de **règles de routage L7** : on filtre sur le nom d'hôte et le chemin, puis on transmet vers un Service. Une seule IP, un seul port (80/443), un nombre illimité d'apps derrière.

```text
client ─▶ Traefik (:80)
           ├─ site.local ─▶ svc/site-svc
           └─ shop.local ─▶ svc/shop
```

La chaîne est toujours **Ingress → Service → Pods**. L'Ingress ne parle jamais directement aux Pods : il transmet au Service, qui répartit la charge vers les Pods.

> [!IMPORTANT]
> Un Ingress n'est qu'un objet de configuration. Sans un **Ingress Controller** en cours d'exécution pour lire et appliquer ces règles, rien ne se passe. Ce cluster fait tourner **Traefik** comme contrôleur : il surveille les objets Ingress et met à jour sa table de routage en temps réel. L'IngressClass s'appelle **`traefik`** ; tu dois définir `ingressClassName: traefik` pour que Traefik prenne en charge ton Ingress.

> [!NOTE]
> Traefik est fourni avec k3s et écoute sur le port **80** (HTTP) et **443** (HTTPS) sur le nœud. Il n'y a rien à installer : il tourne déjà.

Dans cette leçon, tu vas exposer une app via un Service, puis router le trafic HTTP public vers elle avec un Ingress, et le prouver avec une vraie requête en direct.

**Continuer →**
