## Cas 2 : CrashLoopBackOff

Cliquez **Préparer la tâche**. Un Deployment nommé **`crasher`** apparaît — et se comporte
immédiatement mal. Diagnostiquez :

```bash
kubectl get pods
# crasher-xxxx   0/1   CrashLoopBackOff   3   45s    <- RESTARTS climbing
```

`CrashLoopBackOff` = le conteneur **démarre, s'arrête et est redémarré**, encore et encore.
Le kubelet attend de plus en plus longtemps entre chaque tentative (le « back-off »). L'image
s'est téléchargée correctement — le problème est *à l'intérieur*. Deux endroits vous indiquent
pourquoi :

```bash
# The app's own output (the most direct clue):
kubectl logs -l app=crasher
# starting        <- it ran, printed this, then exited

# The events / last state:
kubectl describe pod -l app=crasher | grep -A2 "Last State"
# Last State: Terminated   Reason: Error   Exit Code: 1
```

Code de sortie 1 juste après « starting » — la commande fait son travail et **se termine**.
Un conteneur qui n'a plus rien à exécuter est considéré comme planté. (Causes réelles : une
variable d'environnement manquante, un fichier de configuration introuvable, un serveur qui
échoue à lier un port.)

**Corrigez-le** — ré-appliquez avec une commande qui **continue de s'exécuter** :

```bash
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crasher
spec:
  replicas: 1
  selector:
    matchLabels:
      app: crasher
  template:
    metadata:
      labels:
        app: crasher
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: ["sh", "-c", "echo starting; sleep 3600"]   # <- stays alive
EOF

kubectl get pods -l app=crasher -w      # -> 1/1 Running (RESTARTS stops climbing)
```

Lorsque `crasher` a un Pod **Running** stable, cliquez **Vérifier**. ✅
