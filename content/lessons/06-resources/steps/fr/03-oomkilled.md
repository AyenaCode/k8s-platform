## Déclencher un OOMKilled

Quand un conteneur consomme plus de mémoire que sa limite le permet, l'OOM-killer du noyau Linux lui envoie un SIGKILL (code 137). Kubernetes appelle cet état **OOMKilled**. C'est la première cause de redémarrages en boucle d'un conteneur "en bonne santé" en production.

Tu vas le provoquer exprès pour reconnaître les signaux.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Kind | Pod |
| Name | `hog` |
| Image | `busybox:1.36` |
| Command | `sh -c "tail /dev/zero"` (alloue de la mémoire sans limite) |
| memory request | `10Mi` |
| memory limit | `20Mi` |
| Résultat attendu | Le Pod est OOMKilled en quelques secondes |

### 🔍 Comment la trouver toi-même

Consulte les champs `command` et `resources.limits` :

```bash
kubectl explain pod.spec.containers.command
kubectl explain pod.spec.containers.resources.limits
```

Une fois le Pod démarré, observe-le basculer :

```bash
kubectl get pod hog -w
```

La colonne STATUS va flasher `OOMKilled`, puis `CrashLoopBackOff`. La preuve fiable est l'**état de terminaison du dernier conteneur**, qui persiste entre les redémarrages :

```bash
kubectl get pod hog -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}{"\n"}'
kubectl describe pod hog | grep -A3 "Last State"
```

> [!IMPORTANT]
> Le code de sortie **137** signifie tué par SIGKILL de l'OOM-killer. `CrashLoopBackOff` seul ne dit pas pourquoi : lis toujours `lastState.terminated.reason` et le code de sortie.

> [!WARNING]
> `CrashLoopBackOff` n'est pas toujours un OOMKill. Cela signifie seulement que le conteneur plante en boucle. La cause peut être n'importe quoi : mauvaise config, crash applicatif, ou limite mémoire trop basse.

📖 Docs: [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) · [Pod QoS Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/)

Une fois `hog` OOMKilled au moins une fois, clique sur **Vérifier**. ✅
