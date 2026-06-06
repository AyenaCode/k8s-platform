## Créez un Secret et montez-le en fichier

Les Secrets ont la même structure que les ConfigMaps, mais le kubelet ne les livre qu'aux nœuds qui exécutent réellement un Pod consommateur, et l'accès est contrôlé séparément par le RBAC. Vous allez créer **`app-secret`**, puis le monter en répertoire de fichiers dans un Pod — chaque clé devient un fichier dont le contenu est la valeur.

> [!WARNING]
> Un Secret est **encodé en base64, pas chiffré** au repos par défaut. N'importe qui ayant accès à `kubectl get secret` peut le décoder en quelques secondes. Le RBAC sur les Secrets est obligatoire, pas optionnel.

### Votre tâche

**1. Créez le Secret :**

```bash
kubectl create secret generic app-secret --from-literal=API_KEY=s3cr3t
```

**2. Lancez un Pod qui monte le Secret en volume** sur `/etc/secret` :

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

**3. Attendez Running, puis lisez le fichier monté :**

```bash
kubectl get pod secret-demo -w       # attendez Running, puis Ctrl-C
kubectl exec secret-demo -- cat /etc/secret/API_KEY
```

Ce que « bon » donne :

```text
s3cr3t
```

La clé `API_KEY` est devenue le nom du fichier ; sa valeur en est le contenu.

> [!TIP]
> Les Secrets (et ConfigMaps) montés en volume **se mettent à jour progressivement** quand vous modifiez l'objet — le kubelet re-synchronise en quelques secondes à une minute. Les variables d'env sont **figées** au démarrage du conteneur et nécessitent un redémarrage du Pod. Exception : un montage `subPath` ne se met **pas** à jour automatiquement, même en volume.

Puis cliquez sur **Vérifier**. ✅
