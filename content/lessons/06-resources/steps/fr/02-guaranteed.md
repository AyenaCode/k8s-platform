## Construire un Pod Guaranteed

**Guaranteed** est la classe QoS la plus haute. Cela signifie que le nœud **garantit** que ce conteneur ne sera jamais évincé pour manque de mémoire, car il a réservé exactement ce dont il a besoin. La règle est stricte : chaque conteneur doit définir cpu ET memory, et `limits` doit égaler `requests` pour chacun.

> [!NOTE]
> Les champs de ressources d'un Pod sont immuables après création. Pour les modifier, supprime le Pod et réapplique-le.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Kind | Pod |
| Name | `guaranteed-demo` |
| Image | `nginx:1.27` |
| cpu request | `100m` |
| memory request | `64Mi` |
| Classe QoS | `Guaranteed` (limits == requests pour cpu et memory) |

### 🔍 Comment la trouver toi-même

Commence par regarder tous les champs disponibles dans le bloc `resources` :

```bash
kubectl explain pod.spec.containers.resources
kubectl explain pod.spec.containers.resources.requests
kubectl explain pod.spec.containers.resources.limits
```

Ces commandes t'indiquent les noms exacts des champs, leurs types et les valeurs acceptées. Construis le spec du Pod à partir de ce résultat.

Une fois le Pod démarré, vérifie quelle classe Kubernetes lui a attribuée :

```bash
kubectl get pod guaranteed-demo -o jsonpath='{.status.qosClass}{"\n"}'
kubectl describe pod guaranteed-demo | grep -i qos
```

> [!TIP]
> Si la classe n'est pas `Guaranteed`, relis la règle : **cpu et memory** doivent tous les deux apparaître dans `requests` ET dans `limits`, et les valeurs doivent correspondre exactement.

📖 Docs: [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) · [Pod QoS Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/) · [kubectl quick reference](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `guaranteed-demo` est Running et que sa classe QoS est `Guaranteed`, clique sur **Vérifier**. ✅
