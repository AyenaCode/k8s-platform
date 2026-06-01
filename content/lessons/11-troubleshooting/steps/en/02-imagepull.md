## Case 1: ImagePullBackOff

Click **Prepare task** to break it. A Deployment named **`broken-img`** is created.
Diagnose:

```bash
kubectl get pods
# broken-img-xxxx   0/1   ImagePullBackOff   0   30s
```

`ImagePullBackOff` means the kubelet cannot download the image. Read the Events for
the exact reason:

```bash
kubectl describe pod -l app=broken-img | tail -n 15
# Warning  Failed   ... Failed to pull image "nginx:doesnotexist99999": ...
# Warning  Failed   ... Error: ErrImagePull
# Warning  BackOff  ... Back-off pulling image "nginx:doesnotexist99999"
```

There it is — the tag `doesnotexist99999` is not a real nginx tag, so the pull
fails and Kubernetes backs off and retries. (The same symptom appears for a typo
in the image name, a private registry without credentials, or a wrong digest.)

**Fix it** — re-apply the Deployment with a real image. Same name, valid tag:

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
        image: nginx:1.27        # <- a tag that actually exists
EOF
```

Watch it recover:

```bash
kubectl get pods -l app=broken-img -w     # -> 1/1 Running, then Ctrl-C
```

When `broken-img` has a **Running** Pod, click **Verify**. ✅
