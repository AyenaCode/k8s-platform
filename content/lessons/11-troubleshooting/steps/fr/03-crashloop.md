## Cas 2 : CrashLoopBackOff

Un Deployment appelé `crasher` est en difficulté. L'image s'est bien téléchargée. Mais le conteneur démarre, meurt, et redémarre en boucle. Le compteur RESTARTS grimpe. Quelque chose à l'intérieur du conteneur ne va pas. Tu es le détective : trouve l'indice, corrige le problème.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Deployment | `crasher` |
| Image | `busybox:1.36` |
| État cible | `Running` (READY `1/1`, RESTARTS stable) |

Amène `crasher` à une replica saine et stable.

### 🔍 Comment enquêter

Observe le compteur RESTARTS :

```bash
kubectl get pods
```

Puis regarde ce que le conteneur a dit avant de mourir :

```bash
kubectl logs -l app=crasher
```

Si le conteneur actuel n'a pas encore produit de sortie, lis la dernière exécution :

```bash
kubectl logs -l app=crasher --previous
```

Ensuite, vérifie le code de sortie pour comprendre comment il s'est arrêté :

```bash
kubectl describe pod -l app=crasher
```

Dans la sortie de `describe`, trouve le bloc **Last State** dans la section du conteneur. Regarde `Reason` et `Exit Code`. Ce code est un indice sur le type d'échec.

```bash
kubectl get events --sort-by=.lastTimestamp
```

> [!TIP]
> `CrashLoopBackOff` signifie que l'image elle-même est correcte. Le problème vient de ce que fait le conteneur une fois démarré. Les logs sont ton meilleur indice : ils montrent les derniers mots du conteneur avant qu'il ne s'arrête.

📖 Docs: [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `crasher` est **Running** avec un compteur RESTARTS stable, clique sur **Vérifier**. ✅
