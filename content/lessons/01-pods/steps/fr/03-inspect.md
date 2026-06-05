## Inspecter, logs & exec — la boîte à outils du quotidien

Quand quelque chose déraille, voici les premières commandes à dégainer. Lancez
chacune sur votre Pod `web`.

### Manipulations

**1. Describe** — config complète et **Events** récents (votre premier réflexe
quand un Pod refuse de démarrer) :

```bash
kubectl describe pod web
```

**2. Logs** — ce que le conteneur a écrit sur stdout/stderr :

```bash
kubectl logs web          # ajoutez -f pour suivre en direct, --previous après un crash
```

**3. Exec** — ouvrez un shell *dans* le conteneur :

```bash
kubectl exec -it web -- bash
# vous êtes dans nginx :  ls /usr/share/nginx/html   puis  exit
```

**4. Objet brut** — le Pod exactement tel que le cluster le stocke :

```bash
kubectl get pod web -o yaml | less
```

> **Astuce de pro.** `kubectl events --for pod/web` (avec `--watch`) est la façon
> moderne et plus lisible de lire les events d'un Pod, sans dérouler `describe`.

### Votre tâche

Prouvez que vous avez manipulé le Pod : **labellisez-le** pour que la plateforme
confirme votre passage.

```bash
kubectl label pod web seen=true
```

Puis cliquez sur **Vérifier**. ✅
