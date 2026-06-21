## Executer un Job jusqu'au bout

Un Job, c'est confier une corvee a Kubernetes : "lance ce conteneur jusqu'a ce qu'il sorte proprement, puis arrete-toi." Pas de redemarrage infini. Juste : fini ou pas fini.

Ton objectif : creer un Job, regarder son Pod se terminer, et lire la sortie qu'il a laissee.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Kind | Job |
| Nom | `hello` |
| Image | `busybox:1.36` |
| Commande | affiche quelque chose, puis sort proprement (exit 0) |
| Etat | le Job affiche `1/1` COMPLETIONS |

### 🔍 Comment la trouver toi-meme

Commence par l'aide integree pour voir la forme de la commande :

```bash
kubectl create job --help
```

Lis la ligne synopsis et les exemples. Remarque comment une commande est passee apres `--`.

Une fois le Job cree, suis son Pod et lis la sortie :

```bash
kubectl get jobs,pods
kubectl logs job/hello
```

Tu veux comprendre quels champs du spec controlent les tentatives et le parallelisme ?

```bash
kubectl explain job.spec.backoffLimit
kubectl explain job.spec.completions
```

> [!TIP]
> Tu n'es pas sur que le Pod a termine ? `kubectl get pods -l job-name=hello` te montre la colonne STATUS. `Completed` veut dire exit 0.

📖 Docs : [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/) · [Cheat sheet kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `hello` affiche **`1/1` COMPLETIONS**, clique sur **Verifier**. ✅
