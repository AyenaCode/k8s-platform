## Diagnose and fix an ImagePullBackOff

The platform just deployed `broken-img` with a tag that does not exist. Nothing will run until you fix the image.

### Diagnose

**1. Spot the symptom**: scan the STATUS column:

```bash
kubectl get pods
```

```text
NAME                          READY   STATUS             RESTARTS   AGE
broken-img-7d9f6b8c5-xk2pq   0/1     ImagePullBackOff   0          30s
```

`ImagePullBackOff`: the kubelet tried to pull the image, failed, and is backing off (waiting longer each retry).

**2. Read the Events**: find the exact reason:

```bash
kubectl describe pod -l app=broken-img
```

Scroll to the **Events** section at the bottom:

```text
Warning  Failed   ...  Failed to pull image "nginx:doesnotexist99999": ...
Warning  Failed   ...  Error: ErrImagePull
Warning  BackOff  ...  Back-off pulling image "nginx:doesnotexist99999"
```

Tag `doesnotexist99999` is not a real nginx tag. Pull fails. Kubernetes backs off and retries, forever, until you fix it.

> [!NOTE]
> The same symptom appears for a typo in the image name, a private registry with missing credentials, or a wrong digest. The **Events** message tells you which one.

**3. Check logs**: nothing useful yet (the container never started), but worth confirming:

```bash
kubectl logs -l app=broken-img
```

```text
Error from server (BadRequest): container "app" in pod "..." is waiting to start: trying and failing to pull image
```

### Your task

**1. Re-apply the Deployment** with a valid image tag, keeping the same Deployment name:

```bash
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: broken-img
spec:
  replicas: 1
  selector:
    matchLabels:
      app: broken-img
  template:
    metadata:
      labels:
        app: broken-img
    spec:
      containers:
      - name: app
        image: nginx:1.27        # valid tag: this one will pull
EOF
```

**2. Watch the Pod recover:**

```bash
kubectl get pods -l app=broken-img -w
```

```text
NAME                          READY   STATUS    RESTARTS   AGE
broken-img-6c8d7f9b4-p9mkx   1/1     Running   0          12s
```

> [!TIP]
> Still seeing `ImagePullBackOff` right after applying? Kubernetes is still in the back-off window. Give it up to 5 minutes: the retry interval backs off to 5 min max. Press Ctrl-C and re-run `kubectl get pods` to check again.

Then hit **Verify**. ✅
