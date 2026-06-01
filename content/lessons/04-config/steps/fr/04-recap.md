## base64 ≠ chiffrement

Une chose que tout ingénieur doit savoir sur les Secrets : par défaut ils ne sont
**pas chiffrés**. Ils sont seulement **encodés en base64**, un format texte
réversible — quiconque a un accès en lecture peut les décoder.

Voyez-le vous-même. La valeur brute dans l'API est en base64 :

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}'
# -> czNjcjN0   (ce n'est PAS du chiffrement)
```

Décodez-la en une ligne :

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}' | base64 -d
# -> s3cr3t
```

Alors qu'est-ce qui distingue un Secret d'une ConfigMap ?

- Il n'est **pas** affiché en clair par `kubectl describe`.
- L'accès peut être verrouillé séparément avec le **RBAC**.
- Le kubelet n'envoie un Secret qu'aux nœuds qui exécutent réellement un Pod qui
  l'utilise.
- Le cluster *peut* être configuré pour le **chiffrement au repos** (et vous
  devriez le faire, en production).

> **Idée clé :** un Secret concerne la *manipulation* et le *contrôle d'accès*,
> pas un chiffrement magique. Traitez le contenu comme de vrais secrets —
> restreignez qui peut faire `get` dessus.

Vous connaissez maintenant les deux façons d'injecter la config (env + fichiers)
et la vérité sur le base64. Cette leçon est terminée — cliquez **Suivant** pour
continuer. →
