## Pourquoi les Services existent

Les Pods sont **éphémères** : ils redémarrent, se reprogramment, s'ajoutent et chaque
nouveau Pod reçoit une **IP différente**. On ne peut jamais coder une IP de Pod en dur
et prétendre qu'elle est stable.

Un **Service** règle ce problème. C'est une **IP virtuelle stable + un nom DNS** que
kube-proxy maintient en permanence vers les Pods correspondant à son **sélecteur de
labels**. Les Pods vont et viennent ; l'adresse du Service, elle, ne change jamais.

```text
  Service "web"
  ┌──────────────────────────┐
  │ ClusterIP  10.43.x.x     │
  │ selector:  app=web       │
  └────────┬─────────────────┘
           │ route vers
    ┌──────┴──────┐
  Pod:web-a  Pod:web-b  ← vont et viennent
```

> [!NOTE]
> kube-proxy programme des règles iptables (ou IPVS) sur chaque nœud pour que le
> trafic à destination du ClusterIP soit redirigé vers un vrai Pod. On ne parle
> jamais directement aux Pods.

Les quatre types de Service :

| Type | Joignable depuis | Usage typique |
|------|-----------------|---------------|
| **ClusterIP** (défaut) | l'intérieur du cluster | service-à-service |
| **NodePort** | `<nodeIP>:<30000-32767>` | accès externe rapide / labs |
| **LoadBalancer** | IP externe via LB cloud | ingress en prod cloud ; sur k3s, le **ServiceLB** intégré le prend en charge |
| **ExternalName** | CNAME DNS | alias vers un hôte externe |

Dans cette leçon, tu exposeras un Deployment avec un ClusterIP, l'ouvriras vers
l'extérieur avec un NodePort, et le découvriras par DNS, sur un cluster en direct.

**Continuer →**
