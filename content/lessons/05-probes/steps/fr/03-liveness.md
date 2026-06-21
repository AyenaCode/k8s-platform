## Déclencher un redémarrage de liveness sur un conteneur bloqué

Une probe de liveness est le mécanisme d'autoréparation du cluster. Lorsqu'elle
échoue, le kubelet tue et redémarre le conteneur sans intervention humaine. C'est
comme un chien de garde : « si l'app ne répond plus, redémarre-la. »

Ton travail est de construire un Pod qui casse délibérément sa propre vérification
de liveness, puis de regarder Kubernetes le réparer tout seul.

### 🎯 Mission

Crée un Pod dont la probe de liveness passe au démarrage, puis échoue d'elle-même
après un court délai, provoquant au moins un redémarrage du conteneur.

| Champ | Valeur |
|---|---|
| Nom du Pod | `live-demo` |
| Image | `busybox:1.36` |
| Commande du conteneur | créer un fichier, attendre ~15 s, supprimer le fichier, puis dormir |
| Type de probe | `exec` |
| Commande de la probe | vérifier que le fichier existe encore |
| `initialDelaySeconds` | 5 |
| `periodSeconds` | 5 |
| `failureThreshold` | 1 |
| État final | `RESTARTS >= 1` |

### 🔍 Comment la trouver toi-même

Lis les champs de la probe de liveness :

```bash
kubectl explain pod.spec.containers.livenessProbe --recursive
```

La structure est identique à `readinessProbe` ; seul le nom du champ change.
La page de documentation montre un exemple `exec` fonctionnel ; copie la forme,
pas le contenu.

Observe le Pod pendant son exécution. Tu verras `RESTARTS` passer de `0` à `1` :

```bash
kubectl get pod live-demo -w
```

Après le redémarrage, vérifie pourquoi il s'est produit :

```bash
kubectl describe pod live-demo
```

> [!IMPORTANT]
> Chaque redémarrage réexécute la commande du conteneur depuis le début, donc le
> cycle se répète. C'est exactement ce qui arrive à une vraie application en deadlock :
> une probe de liveness bien calibrée la fait se réparer toute seule.

> [!WARNING]
> `failureThreshold: 1` redémarre dès le premier échec. En production, utilise
> `failureThreshold: 3` (la valeur par défaut) pour éviter les redémarrages
> inutiles sur des incidents passagers.

📖 Docs : [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `live-demo` affiche `RESTARTS >= 1`, clique sur **Vérifier**. ✅
