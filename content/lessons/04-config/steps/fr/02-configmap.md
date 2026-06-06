## Crée une ConfigMap et injecte-la en variables d'env

Une ConfigMap stocke des paires clé/valeur. La façon la plus rapide de la créer est `--from-literal`. Tu vas créer **`app-config`**, puis lancer un Pod qui charge toutes les clés en variables d'environnement via `envFrom`.

### Ta tâche

**1. Crée la ConfigMap** avec deux clés :

```bash
kubectl create configmap app-config \
  --from-literal=LOG_LEVEL=debug \
  --from-literal=GREETING=hello
```

**2. Inspecte ce que tu as créé**, observe la section `data` :

```bash
kubectl get configmap app-config -o yaml
```

Ce que « bon » donne :

```text
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  GREETING: hello
  LOG_LEVEL: debug
```

**3. Lance un Pod qui charge toutes les clés en variables d'env** avec `envFrom` :

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: cm-demo
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    envFrom:
    - configMapRef:
        name: app-config
EOF
```

**4. Attends Running, puis confirme l'injection :**

```bash
kubectl get pod cm-demo -w          # attends Running, puis Ctrl-C
kubectl exec cm-demo -- printenv LOG_LEVEL GREETING
```

Ce que « bon » donne :

```text
debug
hello
```

> [!TIP]
> `envFrom` charge toutes les clés d'un coup. Si tu n'as besoin que d'une clé, utilise `env: valueFrom: configMapKeyRef`, tu contrôles le nom de la variable.

Puis clique sur **Vérifier**. ✅
