## Diagnostiquer et corriger un CrashLoopBackOff

La plateforme vient de déployer `crasher` — un Pod qui démarre et meurt immédiatement. Le kubelet le redémarre en boucle, avec des délais croissants.

### Diagnostiquer

**1. Repérer le symptôme** — regardez le compteur RESTARTS grimper :

```bash
kubectl get pods
```

```text
NAME                      READY   STATUS             RESTARTS   AGE
crasher-5b8f7d9c4-r2zt   0/1     CrashLoopBackOff   4          90s
```

`CrashLoopBackOff` signifie que l'image s'est bien téléchargée, mais que le **conteneur démarre, s'arrête et est redémarré** sans cesse. Le problème est à l'intérieur du conteneur.

**2. Lire les logs** — c'est votre indice le plus direct pour un crash :

```bash
kubectl logs -l app=crasher
```

```text
starting
```

Il a affiché une ligne et s'est arrêté. Voilà toute la sortie. Un conteneur qui n'a plus rien à exécuter est considéré comme planté.

**3. Confirmer le code de sortie** — vérifiez le dernier état :

```bash
kubectl describe pod -l app=crasher
```

Descendez jusqu'à **Last State** dans la section du conteneur :

```text
Last State:  Terminated
  Reason:    Error
  Exit Code: 1
```

> [!NOTE]
> Le code de sortie 1 est une erreur applicative générique. Causes réelles : une variable d'environnement manquante, un fichier de config introuvable au démarrage, ou un serveur qui échoue à se lier à son port. Commencez toujours par les logs — le message de crash s'y trouve.

**4. Lire les logs précédents** — après plusieurs redémarrages, le conteneur actuel n'a peut-être pas encore produit de sortie. Utilisez `--previous` pour lire la dernière exécution terminée :

```bash
kubectl logs -l app=crasher --previous
```

> [!TIP]
> `kubectl events --for pod/<name>` est la façon la plus propre de voir uniquement les events d'un Pod, sans avoir à défiler dans toute la sortie de `describe`.

### Votre tâche

**1. Ré-appliquer le Deployment** avec une commande qui reste active — conservez le même nom de Deployment et la même image :

```bash
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crasher
spec:
  replicas: 1
  selector:
    matchLabels:
      app: crasher
  template:
    metadata:
      labels:
        app: crasher
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["sh", "-c", "echo starting; sleep 3600"]   # reste actif
EOF
```

**2. Confirmer que le compteur RESTARTS s'arrête de grimper :**

```bash
kubectl get pods -l app=crasher -w
```

```text
NAME                      READY   STATUS    RESTARTS   AGE
crasher-6d9c8f7b4-kw4lp   1/1     Running   0          8s
```

Puis cliquez sur **Vérifier**. ✅
