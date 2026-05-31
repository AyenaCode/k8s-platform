# 05 — Scale, Update, Rollback

> **Objective**: Know how to increase capacity, deploy a new version without downtime, and roll back when something goes wrong.

---

## Scale — adjusting the number of pods

```bash
kubectl scale deployment my-app --replicas=3
```

```
BEFORE                         AFTER
──────                         ─────
Deployment my-app              Deployment my-app
  └── Pod 1  ✓                   ├── Pod 1  ✓
                                 ├── Pod 2  ✓  (new)
                                 └── Pod 3  ✓  (new)
```

### How many replicas in prod?

```
1 replica   →  if the pod crashes = app down, zero tolerance
2 replicas  →  fragile, one crash and you're on the edge
3 replicas  →  prod minimum: survives 1 crash without downtime
5+ replicas →  for high-traffic services
```

**Rule**: In production, minimum 3 replicas for every critical service. A single replica is acceptable only for batch jobs or non-critical internal tools.

### Verify the scaling

```bash
kubectl get pods                    # are all pods Running?
kubectl get deployment my-app       # READY 3/3?
kubectl get endpointslices -l kubernetes.io/service-name=my-app  # does the Service see all 3 pods?
```

---

## Rolling Update — deploy without downtime

### The principle

K8s never cuts all pods at the same time. It replaces pods **one by one**:

```
Initial state: 3 pods v1

Step 1:  v1 v1 v1        →  v1 v1 v1 + v2   (creates a v2)
Step 2:  v1 v1 v1 + v2   →  v1 v1 + v2      (removes a v1)
Step 3:  v1 v1 + v2      →  v1 v1 + v2 + v2  (creates a v2)
Step 4:  ...
Result:  v2 v2 v2                             (zero downtime)
```

At all times, there are always pods serving traffic.

### The commands

```bash
# 1. Build and push the new image
docker build -t user/my-app:v2 .
docker push user/my-app:v2

# 2. Find the exact container name in the Deployment
kubectl describe deployment my-app | grep -A2 "Containers:"
# Containers:
#   mon-conteneur:     ← this name
#     Image: user/my-app:v1

# 3. Trigger the rolling update
kubectl set image deployment/my-app mon-conteneur=user/my-app:v2

# 4. Watch in real time
kubectl rollout status deployment/my-app
# → Waiting for deployment "my-app" rollout to finish: 1 out of 3 new replicas have been updated...
# → deployment "my-app" successfully rolled out

# 5. Verify
kubectl get pods                    # all Running?
kubectl describe pod <pod> | grep Image   # correct version?
```

### Gotcha with the container name

The name in `set image` is the **container** name (`spec.containers[].name`), not the Deployment name. If you get it wrong, K8s will silently update nothing.

To avoid any ambiguity:
```bash
# See the exact container name
kubectl get deployment my-app -o jsonpath='{.spec.template.spec.containers[*].name}'
```

---

## Rollback — going back

K8s keeps a history of ReplicaSets (= versions of your Deployment).

```bash
# View version history
kubectl rollout history deployment/my-app

# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         <none>
# 3         <none>

# View the details of a specific revision
kubectl rollout history deployment/my-app --revision=2

# Roll back to the previous version (immediately)
kubectl rollout undo deployment/my-app

# Roll back to a specific revision
kubectl rollout undo deployment/my-app --to-revision=1

# Verify the rollback is complete
kubectl rollout status deployment/my-app
```

```
v1  →  v2  →  bug in prod!  →  undo  →  v1
                                   in a few seconds
```

**In prod, rollback is your safety net.** A deployment that breaks something? `rollout undo` and you are back to the previous state in seconds, not minutes.

---

## Deployment strategies

### RollingUpdate (default)

Replaces pods progressively. This is the default behavior.

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1         # how many pods ABOVE the desired count
      maxUnavailable: 0   # how many pods can be unavailable
```

- `maxSurge: 1, maxUnavailable: 0` → the safest: create first, delete after. Never missing pods.
- `maxSurge: 0, maxUnavailable: 1` → resource-efficient but always one pod short.

### Recreate

Deletes ALL pods first, then creates the new ones. **Causes downtime.**

```yaml
spec:
  strategy:
    type: Recreate
```

Use only when old and new versions cannot coexist (e.g.: incompatible DB schema migration).

---

## Visual summary

```
docker build + push
        │
        ▼
kubectl set image       ← triggers the rolling update
        │
        ▼
   K8s replaces         ← pod by pod, without cutting traffic
   the pods
        │
        ▼
kubectl rollout status  ← confirms everything is OK
        │
   bug detected?
        │
        ▼
kubectl rollout undo    ← returns to the previous version
                           in a few seconds
```

---

## Checklist before a prod deployment

```
[ ] The image is built with a precise version tag (not :latest)
[ ] The image is pushed to the registry
[ ] The deployment has at least 3 replicas
[ ] You know which container to update (kubectl describe deployment)
[ ] You are watching the rollout (kubectl rollout status)
[ ] You check the logs of the new pods
[ ] You know the rollback command if something breaks
```
