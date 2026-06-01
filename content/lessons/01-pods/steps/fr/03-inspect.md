## Inspecter, logs & exec — votre boîte à outils de debug

Ces quatre commandes sont celles que vous taperez tous les jours. Essayez chacune
sur votre Pod `web` :

**1. Describe** — config + **Events** récents (votre mine d'or quand ça casse) :

```bash
kubectl describe pod web
```

**2. Logs** — ce que le conteneur a écrit sur stdout/stderr :

```bash
kubectl logs web
```

**3. Exec** — ouvrir un shell *dans* le conteneur :

```bash
kubectl exec -it web -- bash
# vous êtes dans nginx ; essayez :  ls /usr/share/nginx/html  puis  exit
```

**4. YAML** — voir l'objet complet tel que stocké par le cluster :

```bash
kubectl get pod web -o yaml | less
```

### Votre tâche

Pour valider cette étape, **labellisez** votre Pod afin que la plateforme
confirme votre passage :

```bash
kubectl label pod web seen=true
```

Puis cliquez sur **Vérifier**. ✅
