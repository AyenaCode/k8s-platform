## Inspecter, logs & exec : la boîte à outils du quotidien

Quand quelque chose déraille, voici les premières commandes à dégainer. Lance
chacune sur ton Pod `web`.

### Manipulations

**1. Describe** : config complète et **Events** récents (ton premier réflexe
quand un Pod refuse de démarrer) :

```bash
kubectl describe pod web
```

**2. Logs** : ce que le conteneur a écrit sur stdout/stderr :

```bash
kubectl logs web          # ajoute -f pour suivre en direct, --previous après un crash
```

**3. Exec** : ouvre un shell *dans* le conteneur :

```bash
kubectl exec -it web -- bash
# tu es dans nginx :  ls /usr/share/nginx/html   puis  exit
```

**4. Objet brut** : le Pod exactement tel que le cluster le stocke :

```bash
kubectl get pod web -o yaml | less
```

> [!TIP]
> `kubectl events --for pod/web` (avec `--watch`) est la façon moderne et plus
> lisible de lire les events d'un Pod, sans dérouler `describe`.

### Ta tâche

Prouve que tu as manipulé le Pod : **labellise-le** pour que la plateforme
confirme ton passage.

```bash
kubectl label pod web seen=true
```

Puis clique sur **Vérifier**. ✅
