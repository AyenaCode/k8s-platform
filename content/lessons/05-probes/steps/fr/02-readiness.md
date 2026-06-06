## Contrôler le trafic avec une probe de readiness

Déploie un Pod dont la probe de readiness ne passe que lorsque `/tmp/healthy`
existe. Il démarre *sans* ce fichier, il tourne donc, mais reste **not ready** et
ne reçoit aucun trafic.

### Ta tâche

**1. Applique le Pod.**

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: ready-demo
  labels:
    app: ready-demo
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    readinessProbe:
      exec:
        command: ["cat", "/tmp/healthy"]
      initialDelaySeconds: 2
      periodSeconds: 3
      failureThreshold: 1
EOF
```

**2. Observe la colonne READY**, elle reste à `0/1` même si STATUS indique `Running` :

```bash
kubectl get pod ready-demo -w        # READY 0/1, Ctrl-C quand tu l'as vu
```

Ce que tu devrais voir :

```text
NAME         READY   STATUS    RESTARTS   AGE
ready-demo   0/1     Running   0          5s
```

Le conteneur tourne, mais Kubernetes ne lui achemine aucun trafic.

> [!NOTE]
> Une probe de readiness en échec **ne redémarre jamais** le conteneur. Elle retire
> simplement le Pod des endpoints de son Service. Le trafic s'arrête ; le processus
> continue de tourner.

**3. Fais passer la probe** en créant le fichier dans le conteneur :

```bash
kubectl exec ready-demo -- touch /tmp/healthy
```

**4. Confirme** que le Pod est passé à `1/1` READY, avec RESTARTS toujours à `0` :

```bash
kubectl get pod ready-demo
```

Ce que « bon » donne :

```text
NAME         READY   STATUS    RESTARTS   AGE
ready-demo   1/1     Running   0          30s
```

`RESTARTS 0` est la preuve : la readiness a contrôlé le trafic sans toucher au conteneur.

Puis clique sur **Vérifier**. ✅
