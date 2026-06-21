## L'ouvrir vers l'extérieur avec NodePort

Un ClusterIP ne fonctionne qu'à l'intérieur du cluster. Un **NodePort** perce un trou : il choisit un port entre 30000-32767 sur chaque nœud et y redirige le trafic venant de l'extérieur.

C'est comme ouvrir une porte spécifique dans le bâtiment pour que les visiteurs puissent entrer depuis la rue.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Ressource à créer | Service |
| Nom | `web-np` |
| Type | `NodePort` |
| Port | `80` |
| Preuve | `curl localhost:<nodePort>` retourne HTTP 200 |

### 🔍 Comment la trouver toi-même

Tu connais déjà `kubectl expose`. Maintenant tu dois changer le type et le nom :

```bash
kubectl expose --help              # cherche les flags --type et --name
kubectl explain service.spec.type  # vois les valeurs de type valides
```

Après la création, trouve le port de nœud attribué :

```bash
kubectl get svc web-np
```

La colonne `PORT(S)` affiche `80:<nodePort>/TCP`. Utilise ce port pour tester depuis ce terminal (il partage le réseau du nœud) :

```bash
kubectl get svc web-np -o jsonpath='{.spec.ports[0].nodePort}'
```

> [!NOTE]
> Sur un vrai cluster cloud, tu utilises l'IP externe du nœud plutôt que `localhost`. Pour la production, préfère **type: LoadBalancer**.

📖 Docs : [Service](https://kubernetes.io/docs/concepts/services-networking/service/) · [Aide-mémoire kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `web-np` existe et que le port de nœud retourne HTTP 200, clique sur **Vérifier**. ✅
