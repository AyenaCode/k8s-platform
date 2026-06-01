## Dépasser une limite mémoire (OOMKilled)

Passons maintenant à la démonstration spectaculaire. Déployez un conteneur avec une limite mémoire très faible de **20Mi**, puis faites-lui allouer de la mémoire sans limite. `tail /dev/zero` lit un flux infini d'octets nuls en mémoire — un classique des processus gouffres à mémoire :

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

En quelques secondes le conteneur dépasse 20Mi et l'OOM-killer du noyau le termine. Observez le STATUS passer à `OOMKilled`, puis à `CrashLoopBackOff` au fil des redémarrages :

```bash
kubectl get pod hog -w        # observez OOMKilled / CrashLoopBackOff, puis Ctrl-C
```

Le STATUS est transitoire ; la preuve **fiable** est l'état de terminaison du dernier conteneur :

```bash
kubectl get pod hog -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}{"\n"}'
# -> OOMKilled

kubectl describe pod hog | grep -A3 "Last State"
# Last State: Terminated   Reason: OOMKilled   Exit Code: 137
```

Le code de sortie **137** = tué par le signal 9 (SIGKILL) de l'OOM-killer. En production, c'est la cause numéro 1 qu'un conteneur « normal » continue de mourir — sa limite mémoire est trop basse.

Quand `hog` affiche **lastState reason `OOMKilled`**, cliquez **Vérifier**. ✅
