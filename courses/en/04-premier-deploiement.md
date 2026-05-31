# 04 — First deployment: from code to a running app

> **Objective**: Understand the complete deployment flow, from building the Docker image to the application accessible in the browser.

---

## The complete flow

```
your code (server.js, app.py, main.go...)
   │
   ▼
┌─────────────────────────────────┐
│  1. docker build                │  Creates an image from the Dockerfile
│     docker build -t hello:v1 .  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  2. docker push                 │  Pushes the image to a registry
│     docker tag hello:v1         │  (Docker Hub, ECR, GCR, etc.)
│       user/hello:v1             │
│     docker push user/hello:v1   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  3. kubectl create deployment   │  K8s pulls the image from the registry
│     my-app --image=user/hello:v1│  and creates the Pods
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  4. kubectl expose deployment   │  Creates a Service that routes
│     my-app --port=80            │  traffic to the Pods
│     --target-port=3000          │
│     --type=NodePort             │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  5. minikube service my-app     │  Opens the browser at the URL
│     (local only)                │
└─────────────────────────────────┘
```

---

## Step by step with verification

### Step 1 — Build the Docker image

```bash
# In the folder containing the Dockerfile
docker build -t mon-app:v1 .

# Verify the image exists
docker images | grep mon-app
```

### Step 2 — Push to a registry

```bash
# Tag for Docker Hub (replace "user" with your username)
docker tag mon-app:v1 user/mon-app:v1

# Push
docker push user/mon-app:v1
```

**minikube tip**: Locally, you can skip the push by using minikube's Docker daemon:
```bash
eval $(minikube docker-env)     # switch to minikube's Docker
docker build -t mon-app:v1 .    # the image is directly inside minikube
# Then use imagePullPolicy: Never in your YAML
```

### Step 3 — Create the Deployment

```bash
kubectl create deployment my-app --image=user/mon-app:v1
```

**Verification**:
```bash
kubectl get pods              # STATUS should be "Running"
kubectl logs <pod-name>       # The app should start without errors
```

If the pod is not Running, see chapter 07-debug-production.

### Step 4 — Expose with a Service

```bash
kubectl expose deployment my-app --port=80 --target-port=3000 --type=NodePort
```

**Verification**:
```bash
kubectl get svc               # The service should appear
kubectl get endpointslices -l kubernetes.io/service-name=my-app  # Should list pod IPs (not empty!)
```

### Step 5 — Access the application

```bash
# Locally with minikube
minikube service my-app       # opens the browser automatically

# Or manually
minikube ip                   # retrieves the node IP
kubectl get svc my-app        # PORT(S) column → e.g.: 80:31234/TCP
# → http://<minikube-ip>:31234
```

---

## What happens inside the cluster

```
YOUR BROWSER
     │
     │  http://192.168.x.x:31234  (NodePort)
     ▼
┌──────────────────────────────────────────────┐
│                WORKER NODE                   │
│                                              │
│  kube-proxy receives the traffic             │
│     │                                        │
│     ▼                                        │
│  ┌─────────────────────────────────────┐     │
│  │             SERVICE                 │     │
│  │  port: 80  →  targetPort: 3000      │     │
│  │  selector: app=my-app               │     │
│  └──────────────┬──────────────────────┘     │
│                 │  routes to pods             │
│                 │  with the label             │
│                 │  "app: my-app"              │
│     ┌───────────┼───────────┐                │
│     ▼           ▼           ▼                │
│  ┌──────┐   ┌──────┐   ┌──────┐             │
│  │ Pod  │   │ Pod  │   │ Pod  │             │
│  │:3000 │   │:3000 │   │:3000 │             │
│  └──────┘   └──────┘   └──────┘             │
└──────────────────────────────────────────────┘
```

---

## Understanding ports

```
EXTERNAL         SERVICE            CONTAINER
(browser)        (cluster)          (your app)

:31234     →     :80          →     :3000
(NodePort)       (--port)           (--target-port)
```

| Port | Where | Who defines it |
|---|---|---|
| **NodePort** (31234) | On the node, accessible from your machine | K8s assigns it automatically (30000-32767) |
| **port** (80) | Service port inside the cluster | You, via `--port` |
| **targetPort** (3000) | Port your app actually listens on | You, via `--target-port` (must match your code) |

**Gotcha**: If your app listens on port 3000 and you set `--target-port=80`, the Service sends traffic to the wrong port → connection refused.

---

## Labels — the automatic glue

When you run `kubectl expose`, K8s automatically copies the Deployment's labels into the Service's selector:

```
DEPLOYMENT                    SERVICE
──────────                    ───────
template:                     selector:
  labels:                       app: my-app  ← automatic copy
    app: my-app ─────────────────────────────┘
```

That is why the `expose` command is so short — it infers the link.

---

## Verification checklist for every deployment

```bash
# 1. Are the pods running?
kubectl get pods
# → Look for STATUS: Running, READY: 1/1

# 2. No errors in the logs?
kubectl logs <pod-name>
# → Your app should start normally

# 3. Does the Service exist and target pods?
kubectl get svc
kubectl get endpointslices -l kubernetes.io/service-name=my-app
# → The endpoint list must NOT be empty

# 4. When in doubt, events tell the whole story
kubectl get events --sort-by='.lastTimestamp'
```

---

## Exercise: testing crash and self-healing

The sample app in `app/` has an `/error` endpoint that crashes the pod.

```bash
# Terminal 1: watch pods in real time
kubectl get pods -w

# Terminal 2: trigger the crash
curl http://$(minikube ip):<nodeport>/error

# Watch in terminal 1:
# Running → Error → CrashLoopBackOff → Running
# K8s recreated the pod automatically.
# That is the reconciliation loop in action.
```
