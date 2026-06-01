## Injecter la config en variables d'env

D'abord, créez une ConfigMap nommée **`app-config`** avec deux clés :

```bash
kubectl create configmap app-config \
  --from-literal=LOG_LEVEL=debug \
  --from-literal=GREETING=hello
```

Regardez ce que vous avez créé :

```bash
kubectl get configmap app-config -o yaml
```

Maintenant, lancez un Pod qui charge **toutes** les clés de la ConfigMap en
variables d'environnement, grâce à `envFrom`. Collez tout ce bloc :

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

Attendez qu'il tourne, puis lisez la variable d'env **depuis l'intérieur** du
conteneur :

```bash
kubectl get pod cm-demo -w          # attendez Running, puis Ctrl-C
kubectl exec cm-demo -- printenv LOG_LEVEL GREETING
```

Vous devriez voir `debug` et `hello`. Le Pod ne connaissait pas ces valeurs — le
cluster les a injectées depuis la ConfigMap.

Quand `cm-demo` est **Running** et affiche les variables, cliquez **Vérifier**. ✅
