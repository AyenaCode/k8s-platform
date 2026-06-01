## Requests, limits et classes QoS

Chaque conteneur peut déclarer deux valeurs pour le CPU et la mémoire :

- **`requests`** — ce qui est *garanti* au conteneur. Le scheduler utilise les requests pour choisir un nœud disposant de suffisamment de ressources. Il s'agit d'une **réservation**.
- **`limits`** — le *plafond*. Dépasser la limite de **mémoire** entraîne l'**arrêt** du conteneur par le noyau (OOMKilled). Dépasser la limite de **CPU** provoque simplement une **limitation** (ralentissement), pas un arrêt.

```yaml
resources:
  requests: { cpu: "100m", memory: "64Mi" }   # 100m = 0.1 CPU core
  limits:   { cpu: "200m", memory: "128Mi" }
```

À partir de ces valeurs, Kubernetes attribue à chaque Pod une **classe de Quality of Service (QoS)**, qui détermine l'ordre d'éviction lorsqu'un nœud manque de mémoire :

| Classe QoS | Règle | Évicté… |
|---|---|---|
| **Guaranteed** | chaque conteneur définit cpu **et** mémoire, et `limits == requests` | **en dernier** |
| **Burstable** | possède des requests/limits, mais pas Guaranteed | entre les deux |
| **BestEffort** | aucune request ni limit | **en premier** |

> **Idée clé :** les requests concernent la *planification et la protection* ; les limits concernent le *confinement*. Définissez les requests mémoire égales aux limits pour tout ce qui ne doit pas être tué.

Dans cette leçon vous allez construire un Pod **Guaranteed**, puis dépasser délibérément une limite de mémoire et observer le noyau l'**OOMKiller**. →
