## Déclencher un OOMKilled

Déployez un conteneur avec une limite mémoire de **20Mi**, puis faites-lui allouer
de la mémoire sans limite. `tail /dev/zero` lit un flux infini d'octets nuls en
mémoire — l'OOM-killer du noyau le termine dès qu'il dépasse la limite.

### Votre tâche

**1. Appliquez le Pod hog :**

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: hog
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "tail /dev/zero"]
    resources:
      requests: { memory: "10Mi" }
      limits:   { memory: "20Mi" }
EOF
```

**2. Observez le STATUS basculer** — en quelques secondes il dépasse 20Mi et le
noyau le tue :

```bash
kubectl get pod hog -w        # Ctrl-C dès que vous voyez OOMKilled
```

Ce que « bon » donne :

```text
NAME   READY   STATUS       RESTARTS   AGE
hog    0/1     OOMKilled    0          4s
hog    0/1     CrashLoopBackOff   1   8s
```

> [!NOTE]
> Le champ `STATUS` est transitoire — le kubelet redémarre le conteneur et la valeur
> change. La preuve **fiable** est l'**état de terminaison du dernier conteneur**,
> qui persiste entre les redémarrages.

**3. Confirmez la raison OOMKilled :**

```bash
kubectl get pod hog -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}{"\n"}'
```

Ce que « bon » donne :

```text
OOMKilled
```

**4. Inspectez l'état de terminaison complet :**

```bash
kubectl describe pod hog | grep -A3 "Last State"
```

Ce que « bon » donne :

```text
Last State:  Terminated
  Reason:    OOMKilled
  Exit Code: 137
```

> [!IMPORTANT]
> Le code de sortie **137** = tué par le signal 9 (SIGKILL) de l'OOM-killer du
> noyau. C'est la cause n°1 pour laquelle un conteneur « normal » ne cesse de
> redémarrer en production — sa limite mémoire est trop basse. Augmentez la limite
> ou corrigez la fuite.

> [!WARNING]
> `CrashLoopBackOff` ne signifie **pas** forcément OOMKilled — cela indique
> seulement que le conteneur plante en boucle. Lisez toujours
> `lastState.terminated.reason` et le code de sortie pour connaître la vraie cause.

Puis cliquez sur **Vérifier**. ✅
