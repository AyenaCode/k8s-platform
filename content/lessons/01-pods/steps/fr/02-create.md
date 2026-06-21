## Lance ton premier Pod

Place une vraie charge sur le cluster. Pas de copier-coller ici : **c'est toi qui
trouves la commande.** C'est tout l'intérêt. Dans un vrai job, personne ne te
donne la ligne, alors tu entraînes ce réflexe dès maintenant.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Type  | Pod |
| Nom   | `web` |
| Image | `nginx` |
| État  | `Running` (READY `1/1`) |

### 🔍 Comment la trouver toi-même

Tu veux *lancer* quelque chose. Quel verbe `kubectl` fait ça ? Demande à l'outil :

```bash
kubectl run --help        # lis la ligne SYNOPSIS et le premier exemple
```

L'aide te donne la forme : un nom, puis `--image=`. Construis ta propre ligne à
partir de ça. Ensuite observe le démarrage jusqu'à `Running` :

```bash
kubectl get pods -w        # mises à jour en direct, Ctrl-C pour arrêter
```

> [!TIP]
> **Bloqué sur `ContainerCreating` ?** L'image se télécharge (premier pull).
> Patiente quelques secondes et réobserve. C'est normal, pas une erreur.

📖 Doc : [kubectl run](https://kubernetes.io/docs/reference/kubectl/quick-reference/) · [Pods](https://kubernetes.io/docs/concepts/workloads/pods/)

Quand `web` est **Running**, clique sur **Vérifier**. ✅
