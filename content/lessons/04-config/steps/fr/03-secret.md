## Monter un Secret en fichier

Les Secrets fonctionnent comme les ConfigMaps mais contiennent des données
sensibles. Créez-en un :

```bash
kubectl create secret generic app-secret --from-literal=API_KEY=s3cr3t
```

Cette fois, au lieu de variables d'env, **montez** le Secret en fichiers. Chaque
clé devient un fichier dont le contenu est la valeur. Collez ce bloc :

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: secret-demo
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
    volumeMounts:
    - name: secret-vol
      mountPath: /etc/secret
      readOnly: true
  volumes:
  - name: secret-vol
    secret:
      secretName: app-secret
EOF
```

Une fois Running, lisez le fichier monté :

```bash
kubectl get pod secret-demo -w       # attendez Running, puis Ctrl-C
kubectl exec secret-demo -- cat /etc/secret/API_KEY
```

Vous devriez voir `s3cr3t`. La clé `API_KEY` est devenue un fichier à
`/etc/secret/API_KEY`.

> **Pourquoi monter plutôt qu'env ?** Les secrets montés **se mettent à jour
> automatiquement** quand vous changez le Secret (pas les variables d'env — elles
> sont figées au démarrage du conteneur). Les fichiers gardent aussi les secrets
> hors de `kubectl describe` et de la liste des processus.

Quand `secret-demo` est **Running** et que le fichier affiche `s3cr3t`, cliquez
**Vérifier**. ✅
