## Exécuter un Job jusqu'à sa complétion

Créez un Job nommé **`hello`** qui affiche une ligne et se termine :

```bash
kubectl create job hello --image=busybox:1.36 -- /bin/sh -c "echo hello from a job; sleep 2"
```

Un Job crée un Pod, l'exécute et enregistre s'il a **réussi**. Observez-le passer de l'état en cours à l'état terminé :

```bash
kubectl get pods -l job-name=hello -w     # Running -> Completed, then Ctrl-C
```

Vous pouvez **attendre** que le Job soit terminé — pratique dans les scripts et les pipelines :

```bash
kubectl wait --for=condition=complete job/hello --timeout=60s
```

Vérifiez le résultat. Un Job enregistre le nombre de Pods ayant réussi :

```bash
kubectl get job hello
# NAME    COMPLETIONS   DURATION   AGE
# hello   1/1           4s         20s

kubectl logs -l job-name=hello       # see "hello from a job"
```

Notez que le Pod terminé **reste présent** pour que vous puissiez lire ses logs — il n'est pas nettoyé automatiquement (sauf si vous définissez `ttlSecondsAfterFinished`).

Lorsque `hello` affiche **`1/1` COMPLETIONS**, cliquez **Vérifier**. ✅
