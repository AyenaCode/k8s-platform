## Pourquoi un Ingress ?

Vous savez déjà comment atteindre un Pod depuis l'extérieur avec un Service **NodePort**. Mais
les NodePorts sont peu pratiques à grande échelle : un port élevé aléatoire par application, sans
noms d'hôte, sans chemins, sans TLS. Les vrais clusters exposent le trafic **HTTP** via une
seule porte d'entrée intelligente — un **Ingress**.

Un Ingress est un ensemble de **règles de routage** : « hôte `shop.example.com` → Service `shop` ;
chemin `/api` → Service `api` ». Une seule IP, un seul port (80/443), de nombreuses applications.

Les règles sont inutiles seules — elles nécessitent un **Ingress Controller** pour les appliquer
(un reverse proxy qui surveille les objets Ingress). Ce cluster utilise **Traefik**,
qui écoute sur le port **80**, avec un IngressClass nommé **`traefik`**.

```
                         ┌── host: shop.local ──▶ Service shop  ──▶ Pods
client ─▶ Traefik (:80) ─┤
                         └── host: site.local ──▶ Service site-svc ──▶ Pods
              ▲
        the Ingress rules tell Traefik how to route
```

La chaîne est toujours **Ingress → Service → Pods**. L'Ingress ne communique jamais directement
avec les Pods ; il transmet au Service, qui répartit la charge vers les Pods.

> **Idée clé :** un Ingress est un routage de couche 7 (HTTP). On filtre sur l'hôte et le chemin,
> puis on envoie vers un Service. Ajoutez TLS et vous obtenez un Ingress de qualité production
> avec un seul objet.

Dans cette leçon, vous allez placer un Service devant une application, puis router le trafic HTTP
public vers lui avec un Ingress — et le prouver avec une vraie requête. →
