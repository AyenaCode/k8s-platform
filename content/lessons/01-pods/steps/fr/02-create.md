## Créez votre premier Pod

Lançons un seul Pod nginx nommé **`web`**. Dans le terminal à droite :

```bash
kubectl run web --image=nginx
```

Kubernetes télécharge l'image `nginx` et place le Pod sur un nœud. Observez-le
démarrer :

```bash
kubectl get pods
# NAME   READY   STATUS              RESTARTS   AGE
# web    0/1     ContainerCreating   0          3s

kubectl get pods -w        # mises à jour en direct ; Ctrl-C pour arrêter
```

Attendez d'atteindre :

```
web    1/1     Running   0    20s
```

- `READY 1/1` → l'unique conteneur est démarré.
- `STATUS Running` → le processus du conteneur tourne.

> S'il reste bloqué sur `ContainerCreating`, l'image se télécharge encore —
> patientez quelques secondes.

Quand votre Pod est **Running**, cliquez sur **Vérifier** ci-dessous pour gagner
de l'XP. ✅
