## StatefulSets : noms stables et disques dédiés

Les Pods d'un Deployment sont interchangeables : noms aléatoires, rien de
partagé. Un StatefulSet donne à chaque membre une **identité stable** et
**son propre disque** qui le suit à travers les redémarrages. Imagine que
chaque travailleur a un bureau attitré, pas un bureau partagé.

Trois garanties que tu obtiens :
- **Des noms stables et ordonnés** : `web-0`, `web-1`, jamais de suffixes
  aléatoires.
- **Un stockage par Pod** : chaque réplique obtient son propre PVC depuis un
  `volumeClaimTemplate`. Supprime `web-0`, il revient rattaché à `data-web-0`.
- **Un déploiement ordonné** : `web-0` devient Ready avant que `web-1` ne
  démarre.

### 🎯 Mission

| Objet | Nom | Champs clés |
|-------|-----|-------------|
| Service (headless) | `db` | `clusterIP: None`, selector `app: db` |
| StatefulSet | `web` | 2 répliques, image `busybox:1.36`, `serviceName: db` |
| Volume par Pod | `data` (devient `data-web-0`, `data-web-1`) | 1 Gi, `ReadWriteOnce`, monté sur `/data` |

A la fin, `web` doit afficher **2/2 ready** et les deux PVCs doivent être
**Bound**.

### 🔍 Comment la trouver toi-même

Explore la spec d'un StatefulSet, en particulier la section
`volumeClaimTemplates` :

```bash
kubectl explain statefulset.spec --recursive | head -60
kubectl explain statefulset.spec.volumeClaimTemplates
kubectl explain statefulset.spec.volumeClaimTemplates.spec
```

Un StatefulSet requiert un Service headless. Vérifie ce qui rend un Service
headless :

```bash
kubectl explain service.spec.clusterIP
```

Après avoir appliqué, observe le déploiement ordonné et confirme que chaque
Pod a obtenu son propre PVC :

```bash
kubectl get pods -l app=db
kubectl get pvc
kubectl rollout status statefulset/web --timeout=120s
```

> [!IMPORTANT]
> Le StatefulSet référence le Service headless par son nom via `serviceName`.
> Applique le Service **avant ou en même temps que** le StatefulSet, sinon le
> contrôleur ne peut pas le trouver.

> [!TIP]
> **Les Pods restent Pending ?** `local-path` provisionne un volume par Pod.
> Attends que `web-0` soit Running avant que `web-1` démarre. Ce délai est
> voulu : c'est le déploiement ordonné.

📖 Docs : [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) · [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand **`web` affiche 2/2 ready** et que les PVCs **`data-web-0`** et **`data-web-1`** sont **Bound**, clique sur **Vérifier**. ✅
