## Comprendre les requests, limits et classes QoS

Chaque conteneur peut déclarer deux valeurs de ressources pour le CPU et la mémoire.

- **`requests`** — ce qui est *garanti* au conteneur. Le scheduler les utilise pour
  trouver un nœud disposant de suffisamment de place. Il s'agit d'une **réservation**.
- **`limits`** — le *plafond* strict. Dépasser la limite de **mémoire** déclenche
  l'**OOMKill** du conteneur par le noyau (code de sortie 137). Dépasser la limite
  de **CPU** provoque un simple **throttling** — un ralentissement, jamais un arrêt.

```yaml
resources:
  requests: { cpu: "100m", memory: "64Mi" }   # 100m = 0,1 cœur CPU
  limits:   { cpu: "200m", memory: "128Mi" }
```

À partir de ces deux valeurs, Kubernetes attribue à chaque Pod une **classe de
Quality of Service (QoS)**, qui détermine l'ordre d'éviction lorsqu'un nœud manque
de mémoire :

| Classe QoS | Règle | Évicté… |
|---|---|---|
| **Guaranteed** | chaque conteneur définit cpu **et** mémoire, et `limits == requests` | **en dernier** |
| **Burstable** | possède au moins une request ou une limit, mais pas Guaranteed | entre les deux |
| **BestEffort** | aucune request ni limit | **en premier** |

> [!IMPORTANT]
> `requests` = protection à la planification — le scheduler refuse de placer un Pod
> sur un nœud incapable de les satisfaire. `limits` = confinement à l'exécution —
> le noyau les applique en temps réel. Définissez `requests == limits` pour la
> mémoire de tout ce qui ne doit pas être OOMKilled.

Dans cette leçon vous allez construire un Pod **Guaranteed**, puis dépasser
délibérément une limite de mémoire et observer le noyau le tuer.

**Continuer →**
