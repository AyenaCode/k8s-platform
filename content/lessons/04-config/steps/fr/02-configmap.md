## Crée une ConfigMap et injecte-la en variables d'env

Une ConfigMap stocke des paires clé/valeur en dehors de ton image. Imagine un post-it de réglages que le cluster remet à ton conteneur au démarrage. Tu vas créer **`app-config`** avec deux clés, puis lancer un Pod qui charge toutes les clés en variables d'environnement.

### 🎯 Mission

| Quoi | Valeur |
|------|--------|
| Nom de la ConfigMap | `app-config` |
| Clé 1 | `LOG_LEVEL=debug` |
| Clé 2 | `GREETING=hello` |
| Nom du Pod | `cm-demo` |
| Image du Pod | `busybox:1.36` |
| Méthode d'injection | toutes les clés en variables d'env (`envFrom`) |
| Preuve | `printenv LOG_LEVEL` dans `cm-demo` affiche `debug` |

### 🔍 Comment la trouver toi-même

Commence par l'aide de l'outil. Tu veux créer une configmap à partir de valeurs littérales :

```bash
kubectl create configmap --help
```

Lis le flag `--from-literal` et les exemples. Construis ta propre commande à partir de là.

Ensuite, tu as besoin d'une spec de Pod qui utilise `envFrom`. Explore le schéma :

```bash
kubectl explain pod.spec.containers.envFrom
kubectl explain pod.spec.containers.envFrom.configMapRef
```

Utilise `--dry-run=client -o yaml` pour prévisualiser ta ConfigMap avant de la créer :

```bash
kubectl create configmap demo --from-literal=CLE=val --dry-run=client -o yaml
```

Une fois les deux créés, inspecte ce que tu as fait :

```bash
kubectl get cm,pod
kubectl get configmap app-config -o yaml
kubectl exec cm-demo -- printenv LOG_LEVEL
```

> [!TIP]
> `envFrom` charge toutes les clés d'un coup. Si tu n'as besoin que d'une clé, `kubectl explain pod.spec.containers.env` montre le chemin `valueFrom.configMapKeyRef` pour contrôler le nom de la variable.

📖 Docs : [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `cm-demo` est Running et que `printenv LOG_LEVEL` retourne `debug`, clique sur **Vérifier**. ✅
