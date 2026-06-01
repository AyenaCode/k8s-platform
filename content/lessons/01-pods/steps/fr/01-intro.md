## Qu'est-ce qu'un Pod ?

Un **Pod** est la plus petite chose déployable dans Kubernetes. Il enveloppe
**un ou plusieurs conteneurs** qui tournent toujours ensemble, sur le même nœud,
en partageant :

- le même **réseau** (une seule IP, les conteneurs se joignent via `localhost`)
- les mêmes **volumes** de stockage

> Voyez un Pod comme un *hôte logique* pour un ensemble de conteneurs fortement
> couplés. Dans 99 % des cas, vous aurez **un seul conteneur par Pod**.

En production, on ne crée presque jamais les Pods à la main — c'est un
**Deployment** qui s'en charge (leçon suivante). Mais comprendre le Pod est la
base de tout le reste.

Quelques faits à retenir :

- Un Pod est **éphémère** : s'il meurt, il n'est *pas* recréé automatiquement
  (c'est le rôle du Deployment). Son nom et son IP ne sont pas stables.
- Chaque Pod reçoit sa **propre IP** dans le réseau du cluster.
- L'image est récupérée et démarrée par le **kubelet** sur le nœud.

À l'étape suivante, vous créerez un vrai Pod dans votre cluster — le terminal à
droite est un shell complet avec `kubectl` déjà connecté. Essayez :

```bash
kubectl get pods
kubectl get nodes
```
