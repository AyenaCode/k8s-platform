## base64 ≠ chiffrement, connais la réalité

Tout ingénieur qui touche à Kubernetes doit comprendre ceci : les Secrets ne sont **pas chiffrés au repos par défaut**. Ils sont encodés en base64 : un format de texte réversible que n'importe qui peut décoder en une commande.

Vérifie-le toi-même :

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}'
```

```text
czNjcjN0
```

Décode-le :

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}' | base64 -d
```

```text
s3cr3t
```

> [!WARNING]
> `czNjcjN0` n'est pas un texte chiffré. C'est simplement la chaîne `s3cr3t` avec un autre alphabet.
> Tout utilisateur pouvant exécuter `kubectl get secret` lit tes identifiants instantanément.

### Ce qui différencie vraiment un Secret d'une ConfigMap

| Propriété | ConfigMap | Secret |
|---|---|---|
| Affiché par `kubectl describe` | Oui (en clair) | Non (masqué) |
| Ressource RBAC distincte | Non | Oui : verrouille l'accès |
| Livraison par le kubelet | Tous les nœuds | Uniquement les nœuds exécutant un Pod consommateur |
| Chiffrement au repos | Non | Optionnel : active `EncryptionConfiguration` |

> [!IMPORTANT]
> En production : active le **chiffrement au repos** (`EncryptionConfiguration` dans l'API server), utilise un gestionnaire de secrets (Vault, AWS Secrets Manager, Sealed Secrets) et applique un RBAC strict. Le base64 est un encodage de transport, pas un contrôle de sécurité.

### Méthodes d'injection, référence rapide

```text
ConfigMap / Secret → Pod

  envFrom     tout  → variables d'env
  valueFrom   1 clé → 1 variable
  volume      tout  → fichiers  (MAJ auto)
  + subPath   1 fichier  (pas de MAJ auto)
```

Tu sais maintenant garder la config hors des images, l'injecter de deux façons, et pourquoi les Secrets exigent un vrai contrôle d'accès. **Continuer →**
