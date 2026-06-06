## Exécuter un Job jusqu'à sa complétion

Un Job crée des Pods, les exécute et enregistre s'ils ont **réussi**. Quand le
nombre requis sort avec le code 0, le Job est marqué terminé — et les Pods
restent présents pour que vous puissiez lire leurs logs.

### Votre tâche

**1. Créez le Job** nommé `hello` :

```bash
kubectl create job hello --image=busybox:1.36 -- /bin/sh -c "echo hello from a job; sleep 2"
```

**2. Observez le Pod passer de `Running` à `Completed` :**

```bash
kubectl get pods -l job-name=hello -w     # Ctrl-C quand Completed
```

Ce que « bon » donne :

```text
NAME          READY   STATUS      RESTARTS   AGE
hello-xxxxx   0/1     Completed   0          8s
```

**3. Attendez la fin du Job** — utile dans les scripts et les pipelines :

```bash
kubectl wait --for=condition=complete job/hello --timeout=60s
```

**4. Confirmez le résultat :**

```bash
kubectl get job hello
```

Ce que « bon » donne :

```text
NAME    COMPLETIONS   DURATION   AGE
hello   1/1           4s         20s
```

**5. Lisez la sortie :**

```bash
kubectl logs -l job-name=hello
```

> [!TIP]
> Le Pod terminé **reste présent** pour que vous puissiez consulter ses logs
> après coup. Définissez `ttlSecondsAfterFinished` dans le spec du Job pour
> un nettoyage automatique.

> [!NOTE]
> Champs clés du spec Job : `completions` (combien de Pods doivent réussir,
> défaut 1), `parallelism` (combien tournent en parallèle, défaut 1),
> `backoffLimit` (nombre max de tentatives avant échec, défaut 6).

Quand `hello` affiche **`1/1` COMPLETIONS**, puis cliquez sur **Vérifier**. ✅
