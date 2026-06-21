## Contrôler le trafic avec une probe de readiness

Une probe de readiness dit à Kubernetes : « ce Pod n'est pas encore prêt à recevoir
du trafic. » Tant qu'elle ne passe pas, le Pod tourne mais ne reçoit aucune requête.
Pas de redémarrage, juste le silence. C'est comme une pancarte « Ne pas déranger »
que l'application contrôle elle-même.

### 🎯 Mission

Crée un Pod qui utilise une probe de readiness de type `exec`. La probe doit vérifier
l'existence d'un fichier qui n'existe pas au démarrage, de sorte que le Pod démarre
mais reste `0/1 READY`. Ensuite, fais passer la probe sans redémarrer le conteneur.

| Champ | Valeur |
|---|---|
| Nom du Pod | `ready-demo` |
| Image | `busybox:1.36` |
| Commande du conteneur | garder le conteneur vivant pendant au moins une heure |
| Type de probe | `exec` |
| Commande de la probe | vérifier qu'un fichier spécifique existe (ton choix de chemin) |
| État initial | `0/1 READY` (fichier absent au démarrage) |
| État final | `1/1 READY`, `RESTARTS` toujours à `0` |

### 🔍 Comment la trouver toi-même

Commence par lire les champs exacts que la probe accepte :

```bash
kubectl explain pod.spec.containers.readinessProbe --recursive
```

Cherche : `exec`, `command`, `initialDelaySeconds`, `periodSeconds`, `failureThreshold`.
La page de documentation officielle contient des exemples courts et copiables ;
adapte-les à ta spec, ne les copie pas mot pour mot.

Pour observer le Pod pendant qu'il n'est pas prêt :

```bash
kubectl get pod ready-demo -w
kubectl describe pod ready-demo
```

Pour faire passer la probe sans redémarrer le conteneur, exécute une commande à l'intérieur :

```bash
kubectl exec ready-demo -- <ta commande ici>
```

> [!TIP]
> **`READY 0/1` ne veut pas dire cassé.** Cela signifie que la probe n'a pas encore
> passé. Le conteneur est vivant. Seul le trafic est bloqué.

📖 Docs : [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `ready-demo` affiche `1/1 READY` avec `RESTARTS 0`, clique sur **Vérifier**. ✅
