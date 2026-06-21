## Ne fige plus la config dans tes images

Une bonne image est **identique dans tous les environnements** : dev, staging, prod. Ce qui change, c'est la *configuration* : un niveau de log, une URL de base de données, une clé d'API. Intègre-les dans l'image et tu dois la reconstruire à chaque changement. C'est la mauvaise approche.

Voici l'analogie :

- **ConfigMap** : un post-it de réglages collé sur le frigo. Tout le monde peut le lire.
- **Secret** : le même post-it, mais enfermé dans un tiroir verrouillé. L'accès est contrôlé.

Les deux s'injectent dans un Pod de deux façons :

| Méthode d'injection | Ce que ça donne dans le conteneur |
|---|---|
| **Variables d'environnement** | `printenv LOG_LEVEL` |
| **Fichiers montés en volume** | `cat /etc/config/log_level` |

> [!NOTE]
> L'image reste générique. Le cluster injecte la bonne config à l'exécution.
> Mets à jour la ConfigMap ou le Secret, redémarre le Pod : c'est fait. Aucun rebuild, aucun nouveau tag.

### Reconnaissance

Ton terminal est connecté à un cluster k3s en direct. Fais le tour :

```bash
kubectl get nodes
kubectl get configmaps
kubectl get secrets
```

Dans cette leçon tu vas créer une ConfigMap, l'injecter dans un Pod en variables d'env, puis créer un Secret et le monter en fichier.

📖 Docs : [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) · [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

**Continuer →**
