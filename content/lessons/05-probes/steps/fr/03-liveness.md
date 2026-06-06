## Déclencher un redémarrage de liveness sur un conteneur bloqué

Une probe de liveness est le mécanisme d'autoréparation du cluster. Lorsqu'elle
échoue, le kubelet **tue et redémarre** le conteneur — sans intervention humaine.

### Votre tâche

**1. Appliquez le Pod.** Il crée `/tmp/alive`, attend 15 s, supprime le fichier,
puis se met en veille. La probe de liveness exécute `cat /tmp/alive` — une fois
le fichier supprimé, la probe échoue et le kubelet redémarre le conteneur :

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

**2. Observez le Pod.** Pendant les ~15 premières secondes tout va bien. Ensuite la
probe échoue et RESTARTS augmente :

```bash
kubectl get pod live-demo -w        # attendez RESTARTS >= 1, puis Ctrl-C
```

Ce que vous devriez voir après le redémarrage :

```text
NAME        READY   STATUS    RESTARTS   AGE
live-demo   1/1     Running   0          10s
live-demo   0/1     Running   1          22s
live-demo   1/1     Running   1          24s
```

**3. Confirmez pourquoi** il a redémarré — consultez les événements du Pod :

```bash
kubectl describe pod live-demo | grep -A2 -i liveness
```

Sortie attendue :

```text
Liveness probe failed: cat: can't open '/tmp/alive': No such file or directory
Container app failed liveness probe, will be restarted
```

> [!IMPORTANT]
> Chaque redémarrage réexécute la commande du conteneur, donc le cycle se répète —
> exactement ce qui arriverait à une vraie application en deadlock. Une probe de
> liveness bien calibrée signifie qu'un Pod bloqué se répare seul, sans alerte
> d'astreinte.

> [!WARNING]
> `failureThreshold: 1` redémarre dès le premier échec. En production, utilisez
> `failureThreshold: 3` (la valeur par défaut) pour éviter les redémarrages
> inutiles sur des incidents passagers.

Puis cliquez sur **Vérifier**. ✅
