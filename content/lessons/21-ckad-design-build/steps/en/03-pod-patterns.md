## Init container plus sidecar

Multi-container Pod questions usually test shared lifecycle and shared storage.
Here the init container writes content, nginx serves it, and a sidecar keeps a
heartbeat file in the same `emptyDir`.

### Your task

Create Pod **`pattern-pod`** in namespace **`ckad-design`**:

- volume `shared`: `emptyDir: {}`
- init container `init-content`, image `busybox:1.36`, writes `CKAD pattern ready` to `/work/index.html`
- container `app`, image `nginx:1.27`, mounts `shared` at `/usr/share/nginx/html`
- container `sidecar`, image `busybox:1.36`, mounts `shared` at `/work` and appends to `/work/heartbeat` in a loop

Useful skeleton:

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

Wait for the Pod, then verify.
