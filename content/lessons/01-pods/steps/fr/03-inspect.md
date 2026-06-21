## Inspecter, logs & exec : la boîte à outils du quotidien

Quand ça casse, ce sont ces quatre commandes que tu dégaines en premier. Voici
*à quoi sert chacune*. Tu les tapes toi-même.

- **describe** → config complète + **Events** récents. Ton premier réflexe quand un Pod refuse de démarrer.
- **logs** → ce que le conteneur a affiché (stdout/stderr). `-f` pour suivre, `--previous` après un crash.
- **exec** → ouvre un shell *dans* le conteneur pour fouiller.
- **get -o yaml** → le Pod exactement tel que le cluster le stocke.

Tu ne te souviens plus des options ? `kubectl describe --help`, `kubectl logs
--help`, `kubectl exec --help`. Demande toujours à l'outil.

### 🎯 Mission

Ton Pod a atterri sur un nœud. **Trouve lequel**, puis tague le Pod avec :

| | |
|-|-|
| Clé du label | `node` |
| Valeur du label | le **nom du nœud** sur lequel tourne ton Pod `web` |

Donc s'il tourne sur un nœud nommé `k3d-server-0`, tu mets `node=k3d-server-0`.

### 🔍 Comment le trouver toi-même

Le nœud où tourne un Pod apparaît dans la sortie **wide** et dans `describe` :

```bash
kubectl get pods -o wide       # regarde la colonne NODE
```

Trouvé le nom ? Il te faut maintenant le verbe qui *ajoute un label* à un objet.
Cherche « label » dans la cheat sheet, ou lance `kubectl label --help` pour la forme.

> [!TIP]
> `kubectl get pod web -o yaml` montre l'objet brut. Le nœud se trouve aussi à
> `.spec.nodeName`. Savoir où vivent les champs dans le YAML, ça paie pour toujours.

📖 Doc : [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) · [Cheat sheet kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand le label correspond au vrai nœud, clique sur **Vérifier**. ✅
