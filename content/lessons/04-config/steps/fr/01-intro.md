## Ne figez plus la config dans vos images

Une bonne image est **identique dans tous les environnements** — dev, staging, prod. Ce qui change, c'est la *configuration* : un niveau de log, une URL de base de données, une clé d'API. Intégrez-les dans l'image et vous êtes obligé de la reconstruire à chaque changement de config. C'est la mauvaise approche.

Kubernetes met à votre disposition deux objets `core/v1` pour garder la config **hors** de l'image :

- **ConfigMap** — réglages non sensibles (niveau de log, feature flags, URLs de services).
- **Secret** — valeurs sensibles (mots de passe, tokens, clés). Même structure, mais contrôlé par le RBAC et géré séparément par le kubelet.

Les deux s'injectent dans un Pod de deux façons :

| Méthode d'injection | Ce que ça donne dans le conteneur |
|---|---|
| **Variables d'environnement** | `printenv LOG_LEVEL` |
| **Fichiers montés en volume** | `cat /etc/config/log_level` |

> [!NOTE]
> L'image reste générique ; le cluster injecte la bonne config à l'exécution.
> Mettez à jour la ConfigMap ou le Secret, redémarrez le Pod — c'est fait. Aucun rebuild, aucun nouveau tag.

### Reconnaissance

Votre terminal est connecté à un cluster k3s en direct. Faites le tour :

```bash
kubectl get nodes
kubectl get configmaps         # probablement juste "kube-root-ca.crt" du système
kubectl get secrets
```

Dans cette leçon vous allez créer une ConfigMap, l'injecter dans un Pod en variables d'env, puis créer un Secret et le monter en fichier. **Continuer →**
