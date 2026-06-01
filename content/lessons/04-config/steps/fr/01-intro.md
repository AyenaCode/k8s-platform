## Pourquoi ConfigMaps & Secrets ?

Une bonne image de conteneur est **la même partout** — dev, staging, prod. Ce qui
change d'un environnement à l'autre, c'est la *configuration* : un niveau de log,
une URL de base de données, une clé d'API. Si vous figez ça dans l'image, il vous
faut une nouvelle image par environnement. C'est la mauvaise approche.

Kubernetes propose deux objets pour garder la config **hors** de l'image :

- **ConfigMap** — réglages non sensibles (niveau de log, feature flags, URLs).
- **Secret** — valeurs sensibles (mots de passe, tokens, clés). Même idée, mais
  stockées et manipulées avec un peu plus de soin.

Les deux se consomment dans un Pod de deux façons :

| Façon | À quoi ça ressemble dans le conteneur |
|---|---|
| **Variables d'environnement** | `echo $LOG_LEVEL` |
| **Fichiers montés** | `cat /etc/config/log_level` |

> **Idée clé :** l'image reste générique ; le cluster injecte la bonne config au
> moment de l'exécution. Changez la config, redémarrez le Pod, c'est fait — sans
> rebuild.

Dans cette leçon vous allez créer une ConfigMap, la fournir à un Pod en variables
d'env, puis faire pareil avec un Secret monté en fichier. Cliquez **Suivant**. →
