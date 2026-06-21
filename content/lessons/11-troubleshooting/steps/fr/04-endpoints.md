## Cas 3 : Service sans endpoints

Celui-ci est le plus délicat. Rien ne plante. Le Pod est sain, le Service existe. Mais le trafic ne passe nulle part. C'est un échec silencieux : pas d'erreur, pas de log, juste rien. Ton rôle : trouver pourquoi le Service n'atteint pas le Pod et corriger ça.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Deployment | `api` |
| Service | `api` |
| État cible | Le Service `api` a au moins un endpoint |

Le Pod tourne déjà. Fais en sorte que le Service route le trafic vers lui.

### 🔍 Comment enquêter

Commence par vérifier que le Pod a l'air sain :

```bash
kubectl get pods -l app=api
```

Puis regarde vers quoi le Service route réellement :

```bash
kubectl get endpoints api
```

Si tu vois `<none>`, le Service n'a aucun Pod vers lequel envoyer du trafic. C'est ton indice principal.

Maintenant compare deux choses côte à côte. D'abord, ce que le Service cherche :

```bash
kubectl get svc api -o yaml
```

Regarde le bloc `spec.selector`.

Ensuite, les labels que les Pods ont réellement :

```bash
kubectl get pods -l app=api --show-labels
```

Compare-les attentivement. Un Service trouve ses Pods en faisant correspondre son selector aux labels des Pods. S'ils ne correspondent pas exactement, le Service route vers rien.

```bash
kubectl get events --sort-by=.lastTimestamp
```

> [!TIP]
> Les Services ne génèrent pas d'events quand leur selector ne correspond à rien. C'est pour ça que cet échec est silencieux. Le seul indice : comparer `kubectl get endpoints` (qui affiche `<none>`) avec le selector et les labels des Pods toi-même.

📖 Docs: [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `kubectl get endpoints api` affiche une IP de Pod au lieu de `<none>`, clique sur **Vérifier**. ✅
