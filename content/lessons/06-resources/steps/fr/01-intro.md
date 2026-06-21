## Requests, limits et classes QoS

Imagine un conteneur comme un client dans un restaurant.

- **`requests`**: la place qu'il **réserve**. Le scheduler refuse de placer un Pod sur un nœud qui ne peut pas honorer cette réservation.
- **`limits`**: le maximum qu'il est **autorisé à consommer**. Dépasse la limite mémoire et le noyau l'expulse (OOMKill, code 137). Dépasse la limite CPU et il est simplement ralenti, jamais tué.

À partir de ces deux valeurs, Kubernetes attribue à chaque Pod une **classe de Quality of Service (QoS)**, qui fixe l'ordre d'éviction quand un nœud manque de mémoire :

| Classe QoS | Règle | Évicté |
|---|---|---|
| **Guaranteed** | chaque conteneur définit cpu ET memory, limits == requests | en dernier |
| **Burstable** | au moins une request ou une limit, mais pas Guaranteed | entre les deux |
| **BestEffort** | rien du tout | en premier |

> [!IMPORTANT]
> `requests` protègent le Pod au moment de la **planification**. `limits` protègent le nœud à l'**exécution**. Ce sont deux leviers distincts, tous deux importants.

Explore les champs de ressources avant de toucher quoi que ce soit :

```bash
kubectl explain pod.spec.containers.resources --recursive
```

📖 Docs: [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) · [Pod QoS Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/)

**Continue vers la première tâche.**
