## Qu'est-ce qu'un Pod ?

Un **Pod** est la plus petite unité que vous déployez dans Kubernetes : une
enveloppe autour d'**un ou plusieurs conteneurs** qui tournent toujours ensemble
sur un même nœud et partagent :

- une **identité réseau** unique — une seule IP de Pod ; les conteneurs dialoguent via `localhost`
- les mêmes **volumes** de stockage

> [!NOTE]
> Un seul conteneur par Pod dans ~99 % des cas. Un Pod est *éphémère* : s'il meurt,
> il n'est **pas** recréé (c'est le rôle d'un Deployment, prochaine mission), et son
> nom comme son IP ne sont pas stables. Le **kubelet** du nœud récupère l'image et
> démarre le conteneur.

En production, on crée rarement les Pods à la main — mais tout objet de plus haut
niveau (Deployments, Jobs, StatefulSets) finit par exécuter des Pods. Maîtrisez
ceci et le reste suivra.

### Reconnaissance

Le terminal à droite est un vrai shell, avec `kubectl` déjà connecté à un cluster
en direct. Faites le tour :

```bash
kubectl get nodes      # les machines qui exécutent vos charges
kubectl get pods       # ce qui tourne maintenant (sans doute rien encore)
```

Ensuite, vous placerez un Pod sur l'un de ces nœuds. **Continuer →**
