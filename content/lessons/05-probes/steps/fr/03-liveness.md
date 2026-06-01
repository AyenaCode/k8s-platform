## La liveness redémarre un conteneur bloqué

Une probe de **liveness** est le mécanisme d'autoréparation du cluster. Lorsqu'elle échoue, le kubelet **tue et redémarre** le conteneur — sans intervention humaine.

Déployez un Pod qui est sain pendant ~15 secondes, puis « se bloque ». Le conteneur crée `/tmp/alive`, attend 15 s, le supprime, puis se met en veille. La probe de liveness exécute `cat /tmp/alive` — une fois le fichier supprimé, la probe échoue :

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: live-demo
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "touch /tmp/alive; sleep 15; rm -f /tmp/alive; sleep 600"]
    livenessProbe:
      exec:
        command: ["cat", "/tmp/alive"]
      initialDelaySeconds: 5
      periodSeconds: 5
      failureThreshold: 1
EOF
```

Observez. Pendant les ~15 premières secondes tout va bien, puis la probe échoue et le kubelet redémarre le conteneur — **RESTARTS augmente** :

```bash
kubectl get pod live-demo -w        # attendez RESTARTS >= 1, puis Ctrl-C
```

Confirmez *pourquoi* il a redémarré dans les événements :

```bash
kubectl describe pod live-demo | grep -A2 -i liveness
# Liveness probe failed: cat: can't open '/tmp/alive': No such file or directory
# Container app failed liveness probe, will be restarted
```

Chaque redémarrage réexécute la commande, donc le cycle se répète — exactement ce qui arriverait à une vraie application en deadlock. En production, une probe de liveness *correcte* signifie qu'un Pod bloqué se répare tout seul.

Quand `live-demo` affiche **RESTARTS ≥ 1**, cliquez **Vérifier**. ✅
