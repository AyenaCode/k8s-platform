## La readiness filtre le trafic

Déployez un Pod dont la probe de **readiness** ne passe que lorsque le fichier `/tmp/healthy` existe. Il démarre **sans** ce fichier, donc il tourne mais reste **not ready** :

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

Observez la colonne READY — elle reste à **`0/1`** même si STATUS indique `Running` :

```bash
kubectl get pod ready-demo -w        # READY 0/1, puis Ctrl-C
```

Le conteneur est actif, mais Kubernetes ne lui enverra aucun trafic. Faites maintenant passer la probe en créant le fichier à l'intérieur du conteneur :

```bash
kubectl exec ready-demo -- touch /tmp/healthy
```

En quelques secondes le Pod passe à **`1/1` READY**. Notez que **RESTARTS reste à `0`** — la readiness ne redémarre jamais un conteneur, elle contrôle uniquement le trafic.

```bash
kubectl get pod ready-demo
```

Quand `ready-demo` affiche **`1/1` READY** avec **0 restart**, cliquez **Vérifier**. ✅
