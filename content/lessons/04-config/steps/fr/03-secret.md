## Crée un Secret et monte-le en fichier

Un Secret a la même structure qu'une ConfigMap, mais enfermé dans un tiroir verrouillé : le kubelet ne le livre qu'aux noeuds qui exécutent réellement un Pod consommateur, et le RBAC contrôle qui peut le lire. Tu vas créer **`app-secret`**, puis le monter en répertoire de fichiers dans un Pod. Chaque clé devient un nom de fichier ; sa valeur en est le contenu.

> [!WARNING]
> Un Secret est **encodé en base64, pas chiffré** au repos par défaut. N'importe qui avec accès à `kubectl get secret` peut le décoder instantanément. Le RBAC sur les Secrets est obligatoire, pas optionnel.

### 🎯 Mission

| Quoi | Valeur |
|------|--------|
| Nom du Secret | `app-secret` |
| Clé | `API_KEY=s3cr3t` |
| Nom du Pod | `secret-demo` |
| Image du Pod | `busybox:1.36` |
| Chemin de montage | `/etc/secret` |
| Preuve | `cat /etc/secret/API_KEY` dans `secret-demo` affiche `s3cr3t` |

### 🔍 Comment la trouver toi-même

Commence par la commande de création :

```bash
kubectl create secret generic --help
```

Lis le flag `--from-literal`. Construis ta propre ligne.

Pour la spec du Pod, tu as besoin d'un volume soutenu par un Secret et d'un volumeMount. Explore :

```bash
kubectl explain pod.spec.volumes.secret
kubectl explain pod.spec.containers.volumeMounts
```

Utilise `--dry-run=client -o yaml` pour prévisualiser ton Secret sans le créer :

```bash
kubectl create secret generic demo --from-literal=CLE=val --dry-run=client -o yaml
```

Une fois les deux créés, inspecte :

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}'
kubectl exec secret-demo -- ls /etc/secret
kubectl exec secret-demo -- cat /etc/secret/API_KEY
```

> [!TIP]
> Les Secrets montés en volume se mettent à jour progressivement quand tu modifies l'objet (le kubelet re-synchronise en quelques secondes à une minute). Les variables d'env sont figées au démarrage du conteneur et nécessitent un redémarrage du Pod. Exception : un montage `subPath` ne se met jamais à jour automatiquement.

📖 Docs : [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `secret-demo` est Running et que `cat /etc/secret/API_KEY` retourne `s3cr3t`, clique sur **Vérifier**. ✅
