## Ne fige plus la config dans tes images

Une bonne image est **identique dans tous les environnements** : dev, staging, prod. Ce qui change, c'est la *configuration* : un niveau de log, une URL de base de données, une clé d'API. Intègre-les dans l'image et tu es obligé de la reconstruire à chaque changement de config. C'est la mauvaise approche.

Kubernetes met à ta disposition deux objets `core/v1` pour garder la config **hors** de l'image :

- **ConfigMap** : réglages non sensibles (niveau de log, feature flags, URLs de services).
- **Secret** : valeurs sensibles (mots de passe, tokens, clés). Même structure, mais contrôlé par le RBAC et géré séparément par le kubelet.

Les deux s'injectent dans un Pod de deux façons :

| Méthode d'injection | Ce que ça donne dans le conteneur |
|---|---|
| **Variables d'environnement** | `printenv LOG_LEVEL` |
| **Fichiers montés en volume** | `cat /etc/config/log_level` |

> [!NOTE]
> L'image reste générique ; le cluster injecte la bonne config à l'exécution.
> Mets à jour la ConfigMap ou le Secret, redémarre le Pod : c'est fait. Aucun rebuild, aucun nouveau tag.

### Reconnaissance

Ton terminal est connecté à un cluster k3s en direct. Fais le tour :

```bash
kubectl get nodes
kubectl get configmaps         # probablement juste "kube-root-ca.crt" du système
kubectl get secrets
```

Dans cette leçon tu vas créer une ConfigMap, l'injecter dans un Pod en variables d'env, puis créer un Secret et le monter en fichier. **Continuer →**
