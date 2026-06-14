## Init container plus sidecar

Les questions de Pod multi-conteneurs testent souvent le cycle de vie partage et
le stockage partage. Ici l'init container ecrit le contenu, nginx le sert, et un
sidecar maintient un fichier heartbeat dans le meme `emptyDir`.

### Ta tache

Cree le Pod **`pattern-pod`** dans le namespace **`ckad-design`** :

- volume `shared` : `emptyDir: {}`
- init container `init-content`, image `busybox:1.36`, ecrit `CKAD pattern ready` dans `/work/index.html`
- conteneur `app`, image `nginx:1.27`, monte `shared` sur `/usr/share/nginx/html`
- conteneur `sidecar`, image `busybox:1.36`, monte `shared` sur `/work` et ajoute des lignes dans `/work/heartbeat` en boucle

Squelette utile :

```bash
kubectl apply -f - <<'YAML'
apiVersion: v1
kind: Pod
metadata:
  name: pattern-pod
  namespace: ckad-design
spec:
  volumes:
  - name: shared
    emptyDir: {}
  initContainers:
  - name: init-content
    image: busybox:1.36
    command: ["/bin/sh", "-c", "echo CKAD pattern ready > /work/index.html"]
    volumeMounts:
    - name: shared
      mountPath: /work
  containers:
  - name: app
    image: nginx:1.27
    volumeMounts:
    - name: shared
      mountPath: /usr/share/nginx/html
  - name: sidecar
    image: busybox:1.36
    command: ["/bin/sh", "-c", "while true; do date >> /work/heartbeat; sleep 10; done"]
    volumeMounts:
    - name: shared
      mountPath: /work
YAML
```

Attends que le Pod soit pret, puis verifie.
