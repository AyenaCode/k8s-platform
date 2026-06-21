## Pourquoi les Services existent

Imagine un Pod comme un taxi : il te prend en charge, te dépose, puis disparait. Le prochain taxi a un autre numéro de plaque. Si ton app code une IP de Pod en dur, cette IP disparait dès que le Pod redémarre.

Un **Service**, c'est comme une centrale de taxi : tu appelles toujours le même numéro, et la centrale te redirige vers le taxi disponible en ce moment.

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

Les quatre types de Service :

| Type | Joignable depuis | Usage typique |
|------|-----------------|---------------|
| **ClusterIP** (défaut) | l'intérieur du cluster | appels service-à-service |
| **NodePort** | `<nodeIP>:<30000-32767>` | accès externe rapide, labs |
| **LoadBalancer** | IP externe via LB cloud | ingress prod sur cloud |
| **ExternalName** | CNAME DNS | alias vers un hôte externe |

> [!NOTE]
> kube-proxy programme des règles de routage sur chaque nœud pour que le trafic vers le ClusterIP atteigne un vrai Pod. On ne parle jamais directement aux Pods.

Explore les types avant de commencer :

```bash
kubectl explain service.spec.type
```

📖 Docs : [Service](https://kubernetes.io/docs/concepts/services-networking/service/)
