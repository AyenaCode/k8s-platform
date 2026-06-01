## Pourquoi les Services ?

Les Pods sont **éphémères** : ils sont créés et détruits en permanence (scaling,
mises à jour, crashes), et chacun reçoit une **nouvelle IP** à chaque fois. On ne
peut donc jamais se fier à l'IP d'un Pod pour joindre son app.

Un **Service** résout ça. C'est une **identité réseau stable** — une IP virtuelle
fixe *et* un nom DNS — qui répartit le trafic sur les Pods correspondant à son
**sélecteur de labels**.

```
            Service "web"  (IP stable 10.43.x + DNS "web")
                  │  selector: app=web
        ┌─────────┼─────────┐
      Pod        Pod        Pod      ← vont et viennent ; le Service les suit
```

Les quatre types de Service :

| Type | Joignable depuis | Usage |
|------|------------------|-------|
| **ClusterIP** (défaut) | l'intérieur du cluster | service-à-service |
| **NodePort** | `<nodeIP>:<30000-32767>` | accès externe rapide / labs |
| **LoadBalancer** | IP externe du LB cloud | ingress en prod cloud |
| **ExternalName** | CNAME DNS | alias vers un hôte externe |

Dans cette leçon vous exposerez un Deployment avec un ClusterIP, l'atteindrez de
l'extérieur via un NodePort, et le découvrirez par DNS — en direct.
